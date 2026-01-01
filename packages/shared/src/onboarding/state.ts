import { onboardingStateSchema, OnboardingState, StatePatch, IATA_CODE_REGEX } from './schemas';

export class OnboardingStatePatchError extends Error {
  constructor(message: string, public readonly path?: string) {
    super(message);
    this.name = 'OnboardingStatePatchError';
  }
}

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

function validateIataArray(value: unknown, path: string): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new OnboardingStatePatchError('Expected array', path);
  }
  const normalized = value.map((v, idx) => {
    if (typeof v !== 'string' || !IATA_CODE_REGEX.test(v)) {
      throw new OnboardingStatePatchError('Invalid IATA code', `${path}[${idx}]`);
    }
    return v;
  });
  return Array.from(new Set(normalized));
}

function validateDateRange(value: unknown, path: string) {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== 'object') {
    throw new OnboardingStatePatchError('Expected object', path);
  }
  const { start, end, flexibleDays } = value as Record<string, unknown>;
  if (start !== undefined && (typeof start !== 'string' || !isoDateRegex.test(start))) {
    throw new OnboardingStatePatchError('Invalid start date', `${path}.start`);
  }
  if (end !== undefined && (typeof end !== 'string' || !isoDateRegex.test(end))) {
    throw new OnboardingStatePatchError('Invalid end date', `${path}.end`);
  }
  if (flexibleDays !== undefined && (typeof flexibleDays !== 'number' || flexibleDays < 0)) {
    throw new OnboardingStatePatchError('Invalid flexibleDays', `${path}.flexibleDays`);
  }
  return {
    ...(start ? { start } : {}),
    ...(end ? { end } : {}),
    ...(flexibleDays !== undefined ? { flexibleDays } : {}),
  } as OnboardingState['dateRange'];
}

function validateTripLength(value: unknown, path: string) {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== 'object') {
    throw new OnboardingStatePatchError('Expected object', path);
  }
  const { min, max } = value as Record<string, unknown>;
  if (min !== undefined && (typeof min !== 'number' || min < 0)) {
    throw new OnboardingStatePatchError('Invalid min', `${path}.min`);
  }
  if (max !== undefined && (typeof max !== 'number' || max < 0)) {
    throw new OnboardingStatePatchError('Invalid max', `${path}.max`);
  }
  if (min !== undefined && max !== undefined && min > max) {
    throw new OnboardingStatePatchError('min cannot exceed max', path);
  }
  return {
    ...(min !== undefined ? { min } : {}),
    ...(max !== undefined ? { max } : {}),
  } as OnboardingState['tripLengthDays'];
}

function validateNumber(
  value: unknown,
  path: string,
  options: { min?: number; max?: number; integer?: boolean } = {},
) {
  if (value === undefined) return undefined;
  const { min, max, integer } = options;
  if (typeof value !== 'number') {
    throw new OnboardingStatePatchError('Expected number', path);
  }
  if (integer && !Number.isInteger(value)) {
    throw new OnboardingStatePatchError('Expected integer', path);
  }
  if (min !== undefined && value < min) {
    throw new OnboardingStatePatchError(`Value must be >= ${min}`, path);
  }
  if (max !== undefined && value > max) {
    throw new OnboardingStatePatchError(`Value must be <= ${max}`, path);
  }
  return value;
}

function validateBoolean(value: unknown, path: string) {
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') {
    throw new OnboardingStatePatchError('Expected boolean', path);
  }
  return value;
}

function validateStringArray(value: unknown, path: string): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new OnboardingStatePatchError('Expected array', path);
  }
  return Array.from(
    new Set(
      value.map((v, idx) => {
        if (typeof v !== 'string') {
          throw new OnboardingStatePatchError('Expected string', `${path}[${idx}]`);
        }
        return v;
      }),
    ),
  );
}

function validateCabin(value: unknown, path: string): OnboardingState['cabin'] | undefined {
  if (value === undefined) return undefined;
  if (value === null) return undefined;
  if (value !== 'economy' && value !== 'premium' && value !== 'business' && value !== 'first') {
    throw new OnboardingStatePatchError('Invalid cabin', path);
  }
  return value;
}

function mergeAddToSet(current: string[] | undefined, additions: string[]) {
  const next = new Set(current ?? []);
  for (const value of additions) {
    next.add(value);
  }
  return Array.from(next);
}

export function applyStatePatch(state: OnboardingState, patch: StatePatch): OnboardingState {
  const next: OnboardingState = { ...state };

  if (patch.unset) {
    for (const key of patch.unset) {
      delete (next as Record<string, unknown>)[key];
    }
  }

  if (patch.set) {
    const parsedSet = onboardingStateSchema.partial().safeParse(patch.set);
    if (!parsedSet.success) {
      const issue = parsedSet.error.issues[0];
      throw new OnboardingStatePatchError(issue.message, issue.path.join('.'));
    }

    const set = patch.set;
    if ('homeAirports' in set) {
      next.homeAirports = validateIataArray(set.homeAirports, 'homeAirports');
    }
    if ('destinationAirports' in set) {
      next.destinationAirports = validateIataArray(set.destinationAirports, 'destinationAirports');
    }
    if ('destinationRegions' in set) {
      next.destinationRegions = validateStringArray(set.destinationRegions, 'destinationRegions');
    }
    if ('dateRange' in set) {
      next.dateRange = validateDateRange(set.dateRange, 'dateRange');
    }
    if ('tripLengthDays' in set) {
      next.tripLengthDays = validateTripLength(set.tripLengthDays, 'tripLengthDays');
    }
    if ('passengers' in set) {
      next.passengers = validateNumber(set.passengers, 'passengers', { min: 1, integer: true });
    }
    if ('maxPoints' in set) {
      next.maxPoints = validateNumber(set.maxPoints, 'maxPoints', { min: 0, integer: true });
    }
    if ('programsAllowed' in set) {
      next.programsAllowed = validateStringArray(set.programsAllowed, 'programsAllowed');
    }
    if ('airlinesPreferred' in set) {
      next.airlinesPreferred = validateStringArray(set.airlinesPreferred, 'airlinesPreferred');
    }
    if ('maxStops' in set) {
      next.maxStops = validateNumber(set.maxStops, 'maxStops', { min: 0, max: 2, integer: true });
    }
    if ('avoidRedEye' in set) {
      next.avoidRedEye = validateBoolean(set.avoidRedEye, 'avoidRedEye');
    }
    if ('maxDurationHours' in set) {
      next.maxDurationHours = validateNumber(set.maxDurationHours, 'maxDurationHours', { min: 0 });
    }
    if ('notes' in set) {
      if (set.notes !== undefined && typeof set.notes !== 'string') {
        throw new OnboardingStatePatchError('Expected string', 'notes');
      }
      next.notes = set.notes;
    }
    if ('cabin' in set) {
      next.cabin = validateCabin(set.cabin, 'cabin');
    }
  }

  if (patch.addToSet) {
    for (const [key, additions] of Object.entries(patch.addToSet)) {
      const field = key as keyof OnboardingState;
      const value = additions;
      if (!Array.isArray(value)) {
        throw new OnboardingStatePatchError('Expected array', `addToSet.${key}`);
      }
      switch (field) {
        case 'homeAirports':
        case 'destinationAirports':
          next[field] = mergeAddToSet(
            validateIataArray(value, `addToSet.${key}`),
            next[field] as string[] | undefined,
          );
          break;
        case 'destinationRegions':
        case 'programsAllowed':
        case 'airlinesPreferred':
          next[field] = mergeAddToSet(
            validateStringArray(value, `addToSet.${key}`),
            next[field] as string[] | undefined,
          );
          break;
        default:
          throw new OnboardingStatePatchError('addToSet unsupported for field', `addToSet.${key}`);
      }
    }
  }

  return onboardingStateSchema.parse(next);
}

export function computeMissingFields(state: OnboardingState): string[] {
  const missing: string[] = [];
  if (!state.homeAirports?.length) {
    missing.push('homeAirports');
  }
  if (!state.destinationAirports?.length && !state.destinationRegions?.length) {
    missing.push('destination');
  }
  const hasDateRange = state.dateRange?.start || state.dateRange?.end;
  if (!hasDateRange) {
    missing.push('dateRange');
  }
  if (state.passengers === undefined) {
    missing.push('passengers');
  }
  return missing;
}

function ruleId(base: string) {
  return `rule_${base}`;
}

export function constraintsToRules(state: OnboardingState) {
  const rules = [] as {
    id: string;
    field: string;
    op: string;
    value: unknown;
    required: boolean;
    source: 'user';
  }[];

  if (state.homeAirports?.length) {
    rules.push({
      id: ruleId('homeAirports'),
      field: 'homeAirport',
      op: 'in',
      value: state.homeAirports,
      required: true,
      source: 'user',
    });
  }
  if (state.destinationAirports?.length) {
    rules.push({
      id: ruleId('destinationAirports'),
      field: 'destination',
      op: 'in',
      value: state.destinationAirports,
      required: true,
      source: 'user',
    });
  }
  if (!state.destinationAirports?.length && state.destinationRegions?.length) {
    rules.push({
      id: ruleId('destinationRegions'),
      field: 'destination',
      op: 'in',
      value: state.destinationRegions,
      required: true,
      source: 'user',
    });
  }
  if (state.dateRange?.start || state.dateRange?.end) {
    rules.push({
      id: ruleId('dateRange'),
      field: 'dateRange',
      op: 'between',
      value: {
        start: state.dateRange?.start,
        end: state.dateRange?.end,
        flexibleDays: state.dateRange?.flexibleDays,
      },
      required: true,
      source: 'user',
    });
  }
  if (state.tripLengthDays && (state.tripLengthDays.min !== undefined || state.tripLengthDays.max !== undefined)) {
    rules.push({
      id: ruleId('tripLengthDays'),
      field: 'tripLengthDays',
      op: 'between',
      value: { min: state.tripLengthDays.min, max: state.tripLengthDays.max },
      required: true,
      source: 'user',
    });
  }
  if (state.cabin) {
    rules.push({ id: ruleId('cabin'), field: 'cabin', op: 'eq', value: state.cabin, required: true, source: 'user' });
  }
  if (state.passengers !== undefined) {
    rules.push({
      id: ruleId('passengers'),
      field: 'passengers',
      op: 'eq',
      value: state.passengers,
      required: true,
      source: 'user',
    });
  }
  if (state.maxPoints !== undefined) {
    rules.push({
      id: ruleId('maxPoints'),
      field: 'maxPoints',
      op: 'lte',
      value: state.maxPoints,
      required: true,
      source: 'user',
    });
  }
  if (state.programsAllowed?.length) {
    rules.push({
      id: ruleId('programsAllowed'),
      field: 'program',
      op: 'in',
      value: state.programsAllowed,
      required: true,
      source: 'user',
    });
  }
  if (state.airlinesPreferred?.length) {
    rules.push({
      id: ruleId('airlinesPreferred'),
      field: 'airline',
      op: 'in',
      value: state.airlinesPreferred,
      required: true,
      source: 'user',
    });
  }
  if (state.maxStops !== undefined) {
    rules.push({
      id: ruleId('maxStops'),
      field: 'maxStops',
      op: 'lte',
      value: state.maxStops,
      required: true,
      source: 'user',
    });
  }
  if (state.avoidRedEye !== undefined) {
    rules.push({
      id: ruleId('avoidRedEye'),
      field: 'avoidRedEye',
      op: 'bool',
      value: state.avoidRedEye,
      required: true,
      source: 'user',
    });
  }
  if (state.maxDurationHours !== undefined) {
    rules.push({
      id: ruleId('maxDurationHours'),
      field: 'maxDurationHours',
      op: 'lte',
      value: state.maxDurationHours,
      required: true,
      source: 'user',
    });
  }

  return rules;
}
