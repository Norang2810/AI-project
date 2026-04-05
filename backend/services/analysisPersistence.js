const {
  sequelize,
  MenuAnalysis,
  AllergenCatalog,
  UserAllergy,
  UserAllergenItem,
  AnalysisJob,
  AnalysisResult,
  MenuItem,
  MenuIngredient,
} = require('../models');

const SEVERITY_VALUES = new Set(['low', 'medium', 'high']);
const RISK_LEVEL_VALUES = new Set(['safe', 'low_risk', 'high_risk', 'dangerous', 'unknown']);

const normalizeText = (value) => {
  const originalText = String(value || '').trim();
  if (!originalText) {
    return '';
  }

  const normalized = originalText
    .toLowerCase()
    .replace(/[^0-9A-Za-z\u3131-\uD79D\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (normalized) {
    return normalized;
  }

  return `raw-${Buffer.from(originalText, 'utf8').toString('hex').slice(0, 96)}`;
};

const toSafeString = (value, maxLength = 150) => {
  const text = String(value || '').trim();
  if (!text) {
    return null;
  }

  return text.slice(0, maxLength);
};

const toNullableNumber = (value, digits = 4) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return Number(value.toFixed(digits));
};

const normalizeSeverity = (severity) =>
  SEVERITY_VALUES.has(severity) ? severity : 'medium';

const normalizeRiskLevel = (riskLevel) =>
  RISK_LEVEL_VALUES.has(riskLevel) ? riskLevel : 'unknown';

const uniqueNames = (values) =>
  Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    )
  );

const upsertAllergenCatalogEntries = async (names, transaction) => {
  const catalogNames = uniqueNames(names);
  if (catalogNames.length === 0) {
    return new Map();
  }

  const normalizedNames = catalogNames.map((name) => normalizeText(name)).filter(Boolean);
  const existingEntries = await AllergenCatalog.findAll({
    where: {
      normalizedName: normalizedNames,
    },
    transaction,
  });

  const existingMap = new Map(
    existingEntries.map((entry) => [entry.normalizedName, entry])
  );

  const missingEntries = catalogNames
    .map((displayName) => ({
      displayName,
      normalizedName: normalizeText(displayName),
    }))
    .filter((entry) => entry.normalizedName && !existingMap.has(entry.normalizedName));

  if (missingEntries.length > 0) {
    await AllergenCatalog.bulkCreate(missingEntries, { transaction });
  }

  const catalogEntries = await AllergenCatalog.findAll({
    where: {
      normalizedName: normalizedNames,
    },
    transaction,
  });

  return new Map(catalogEntries.map((entry) => [entry.normalizedName, entry]));
};

const syncUserAllergyRecords = async ({ userId, allergies, severity }) => {
  const normalizedSeverity = normalizeSeverity(severity);
  const allergyNames = uniqueNames(allergies);

  return sequelize.transaction(async (transaction) => {
    await UserAllergy.destroy({
      where: { userId },
      transaction,
    });

    await UserAllergenItem.destroy({
      where: { userId },
      transaction,
    });

    if (allergyNames.length === 0) {
      return {
        allergies: [],
        severity: normalizedSeverity,
      };
    }

    const catalogMap = await upsertAllergenCatalogEntries(allergyNames, transaction);

    const legacyRecords = allergyNames.map((allergyName) => ({
      userId,
      allergyName,
      severity: normalizedSeverity,
    }));

    const normalizedRecords = allergyNames.map((allergyName) => {
      const normalizedName = normalizeText(allergyName);
      const catalogEntry = catalogMap.get(normalizedName);

      return {
        userId,
        allergenCatalogId: catalogEntry?.id || null,
        allergenName: allergyName,
        normalizedName,
        severity: normalizedSeverity,
        source: catalogEntry ? 'catalog' : 'legacy',
      };
    });

    await UserAllergy.bulkCreate(legacyRecords, { transaction });
    await UserAllergenItem.bulkCreate(normalizedRecords, { transaction });

    return {
      allergies: allergyNames,
      severity: normalizedSeverity,
    };
  });
};

const buildPrimaryMenuItem = ({ analysisResultId, aiResult }) => {
  const displayName =
    toSafeString(aiResult?.translated_text, 150) ||
    toSafeString(aiResult?.enhanced_text, 150) ||
    toSafeString(aiResult?.extracted_text, 150);

  const category = aiResult?.analysis?.menu_classification?.category || null;
  const confidence = toNullableNumber(aiResult?.analysis?.menu_classification?.confidence);
  const riskLevel = normalizeRiskLevel(aiResult?.analysis?.allergy_risk?.final_risk_level);

  if (!displayName && !category) {
    return null;
  }

  return {
    analysisResultId,
    sourceType: 'classification',
    itemRole: 'primary',
    displayName: displayName || 'unclassified-menu',
    normalizedName: normalizeText(displayName || category || 'unclassified-menu'),
    category,
    confidence,
    similarityScore: null,
    safetyScore: null,
    riskLevel,
    metadata: aiResult?.analysis?.menu_classification || null,
  };
};

const buildSecondaryMenuItems = ({ analysisResultId, analysis }) => {
  const items = [];
  const seenKeys = new Set();

  const registerItem = (record) => {
    if (!record || !record.displayName || !record.normalizedName) {
      return;
    }

    const dedupeKey = `${record.sourceType}:${record.normalizedName}`;
    if (seenKeys.has(dedupeKey)) {
      return;
    }

    seenKeys.add(dedupeKey);
    items.push(record);
  };

  for (const item of Array.isArray(analysis?.similar_menus) ? analysis.similar_menus : []) {
    const menu = item?.menu || {};
    const displayName = toSafeString(menu.name, 150);

    registerItem({
      analysisResultId,
      sourceType: 'similarity',
      itemRole: 'similar',
      displayName,
      normalizedName: normalizeText(displayName),
      category: menu.category || null,
      confidence: null,
      similarityScore: toNullableNumber(item?.similarity, 5),
      safetyScore: null,
      riskLevel: 'unknown',
      metadata: item,
    });
  }

  for (const item of Array.isArray(analysis?.recommendations?.safe_alternatives)
    ? analysis.recommendations.safe_alternatives
    : []) {
    const menu = item?.menu || {};
    const displayName = toSafeString(menu.name, 150);

    registerItem({
      analysisResultId,
      sourceType: 'recommendation',
      itemRole: 'alternative',
      displayName,
      normalizedName: normalizeText(displayName),
      category: menu.category || null,
      confidence: null,
      similarityScore: null,
      safetyScore: toNullableNumber(item?.safety_score, 5),
      riskLevel: 'safe',
      metadata: item,
    });
  }

  return items;
};

const buildIngredientRiskLookup = (ruleBasedAnalysis) => {
  const riskLookup = new Map();
  const riskyIngredients = Array.isArray(ruleBasedAnalysis?.risky_ingredients)
    ? ruleBasedAnalysis.risky_ingredients
    : [];

  for (const riskItem of riskyIngredients) {
    const key = normalizeText(riskItem?.ingredient || riskItem?.original_ingredient);
    if (!key) {
      continue;
    }

    riskLookup.set(key, riskItem);
  }

  return riskLookup;
};

const buildMenuIngredientRecords = async ({
  menuItemId,
  ingredients,
  ruleBasedAnalysis,
  transaction,
}) => {
  const ingredientNames = uniqueNames(ingredients);
  if (ingredientNames.length === 0) {
    return [];
  }

  const riskyIngredientLookup = buildIngredientRiskLookup(ruleBasedAnalysis);
  const matchedAllergenNames = Array.from(
    new Set(
      Array.from(riskyIngredientLookup.values())
        .map((riskItem) => String(riskItem?.allergy || '').trim())
        .filter(Boolean)
    )
  );
  const allergenCatalogMap = await upsertAllergenCatalogEntries(matchedAllergenNames, transaction);

  return ingredientNames.map((ingredientName) => {
    const normalizedName = normalizeText(ingredientName);
    const matchedRisk = riskyIngredientLookup.get(normalizedName);
    const matchedAllergenName = matchedRisk?.allergy || null;
    const allergenCatalog = matchedAllergenName
      ? allergenCatalogMap.get(normalizeText(matchedAllergenName))
      : null;

    return {
      menuItemId,
      allergenCatalogId: allergenCatalog?.id || null,
      ingredientName,
      normalizedName,
      sourceType: 'analysis',
      riskLevel: matchedRisk ? 'danger' : 'safe',
      matchedAllergenName,
      isUserAllergen: Boolean(matchedRisk),
      metadata: matchedRisk || null,
    };
  });
};

const createCompletedAnalysisArtifacts = async ({
  userId,
  imageUrl,
  originalFilename,
  fileSize,
  aiResult,
  userAllergies,
  metrics,
}) => {
  if (!aiResult?.analysis) {
    return null;
  }

  return sequelize.transaction(async (transaction) => {
    const legacyMenuAnalysis = await MenuAnalysis.create(
      {
        userId,
        imageUrl,
        originalFilename,
        fileSize,
        extractedText: aiResult.extracted_text,
        translatedText: aiResult.translated_text || aiResult.enhanced_text || null,
        analysisResult: aiResult.analysis,
      },
      { transaction }
    );

    const analysisJob = await AnalysisJob.create(
      {
        userId,
        status: 'completed',
        sourceImageUrl: imageUrl,
        originalFilename,
        fileSize,
        requestLatencyMs: metrics?.requestLatencyMs || null,
        aiLatencyMs: metrics?.aiLatencyMs || null,
        geminiLatencyMs: metrics?.geminiLatencyMs || null,
        startedAt: metrics?.startedAt || null,
        completedAt: metrics?.completedAt || null,
      },
      { transaction }
    );

    const analysis = aiResult.analysis || {};
    const normalizedAnalysisResult = await AnalysisResult.create(
      {
        analysisJobId: analysisJob.id,
        extractedText: aiResult.extracted_text || null,
        translatedText: aiResult.translated_text || null,
        enhancedText: aiResult.enhanced_text || null,
        rawAiResponse: aiResult,
        menuClassification: analysis.menu_classification || null,
        ingredientAnalysis: analysis.ingredient_analysis || null,
        allergyRisk: analysis.allergy_risk || null,
        recommendations: analysis.recommendations || null,
        similarMenus: analysis.similar_menus || null,
      },
      { transaction }
    );

    const primaryMenuItemRecord = buildPrimaryMenuItem({
      analysisResultId: normalizedAnalysisResult.id,
      aiResult,
    });

    let primaryMenuItem = null;
    if (primaryMenuItemRecord) {
      primaryMenuItem = await MenuItem.create(primaryMenuItemRecord, { transaction });
    }

    const secondaryMenuItems = buildSecondaryMenuItems({
      analysisResultId: normalizedAnalysisResult.id,
      analysis,
    });

    if (secondaryMenuItems.length > 0) {
      await MenuItem.bulkCreate(secondaryMenuItems, { transaction });
    }

    if (primaryMenuItem) {
      const ingredientRecords = await buildMenuIngredientRecords({
        menuItemId: primaryMenuItem.id,
        ingredients: analysis?.ingredient_analysis?.extracted_ingredients,
        ruleBasedAnalysis: analysis?.allergy_risk?.rule_based_analysis,
        transaction,
      });

      if (ingredientRecords.length > 0) {
        await MenuIngredient.bulkCreate(ingredientRecords, { transaction });
      }
    }

    return {
      legacyMenuAnalysisId: legacyMenuAnalysis.id,
      analysisJobId: analysisJob.id,
      analysisResultId: normalizedAnalysisResult.id,
    };
  });
};

const createFailedAnalysisJob = async ({
  userId,
  imageUrl,
  originalFilename,
  fileSize,
  errorMessage,
  metrics,
}) => {
  if (!userId) {
    return null;
  }

  return AnalysisJob.create({
    userId,
    status: 'failed',
    sourceImageUrl: imageUrl || null,
    originalFilename: originalFilename || null,
    fileSize: fileSize || null,
    requestLatencyMs: metrics?.requestLatencyMs || null,
    aiLatencyMs: metrics?.aiLatencyMs || null,
    geminiLatencyMs: metrics?.geminiLatencyMs || null,
    errorMessage: errorMessage || 'Unknown analysis failure',
    startedAt: metrics?.startedAt || null,
    completedAt: metrics?.completedAt || null,
  });
};

module.exports = {
  syncUserAllergyRecords,
  createCompletedAnalysisArtifacts,
  createFailedAnalysisJob,
};
