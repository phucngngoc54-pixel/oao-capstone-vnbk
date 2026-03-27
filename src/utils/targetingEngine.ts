import { TargetingRule, SegmentBundle, Experiment, Variant, Operator } from '../types';

export const evaluateRule = (userData: any, rule: TargetingRule): boolean => {
    const userValue = userData[rule.field];
    let result = false;

    switch (rule.operator) {
        case 'EQUALS':
            result = userValue == rule.value;
            break;
        case 'NOT_EQUALS':
            result = userValue != rule.value;
            break;
        case 'CONTAINS':
            result = String(userValue).includes(String(rule.value));
            break;
        case 'NOT_CONTAINS':
            result = !String(userValue).includes(String(rule.value));
            break;
        case 'GREATER_THAN':
            result = Number(userValue) > Number(rule.value);
            break;
        case 'LESS_THAN':
            result = Number(userValue) < Number(rule.value);
            break;
        case 'IN':
            const inList = Array.isArray(rule.value) ? rule.value : String(rule.value).split(',').map(s => s.trim());
            result = inList.includes(String(userValue));
            break;
        case 'NOT_IN':
            const notInList = Array.isArray(rule.value) ? rule.value : String(rule.value).split(',').map(s => s.trim());
            result = !notInList.includes(String(userValue));
            break;
        default:
            result = false;
    }

    return rule.isExcluded ? !result : result;
};

export const evaluateBundle = (userData: any, bundle: SegmentBundle): boolean => {
    if (!bundle.isActive) return false;
    if (bundle.rules.length === 0) return true;

    if (bundle.logicOperator === 'AND') {
        return bundle.rules.every(rule => evaluateRule(userData, rule));
    } else {
        return bundle.rules.some(rule => evaluateRule(userData, rule));
    }
};

/**
 * Deterministic variant assignment using userId and experimentId hash.
 * This ensures the user stays in the same variant for the same experiment.
 */
export const assignVariant = (userId: string, experiment: Experiment): Variant | null => {
    if (!experiment.variants || experiment.variants.length === 0) return null;
    if (experiment.status !== 'Running' && experiment.status !== 'Ended') return experiment.variants[0]; // Default to first variant if not running

    const hashString = `${userId}:${experiment.id}`;
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
        hash = (hash << 5) - hash + hashString.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }

    const positiveHash = Math.abs(hash);
    const bucket = positiveHash % 100;

    let cumulativeWeight = 0;
    for (const variant of experiment.variants) {
        cumulativeWeight += variant.weight;
        if (bucket < cumulativeWeight) {
            return variant;
        }
    }

    return experiment.variants[0];
};
