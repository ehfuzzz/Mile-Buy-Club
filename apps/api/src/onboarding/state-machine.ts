import {
  ConstraintViolation,
  PatchOp,
  PatchResult,
  StatePatch,
  USER_STATE_SCHEMA,
  UserState,
} from '@mile/shared';

const PATCHABLE_PATHS: RegExp[] = [
  /^\/onboarding\/status$/,
  /^\/onboarding\/completedAt$/,
  /^\/profile\/locale$/,
  /^\/profile\/timezone$/,
  /^\/travelPrefs\/homeAirports(?:\/\d+)?$/,
  /^\/travelPrefs\/cabinPreference$/,
  /^\/travelPrefs\/maxStops$/,
  /^\/travelPrefs\/noRedeyes$/,
  /^\/points\/programs$/,
  /^\/points\/programs\/\d+$/,
  /^\/points\/programs\/\d+\/programId$/,
  /^\/points\/programs\/\d+\/balance$/,
  /^\/points\/transferPreferences$/,
  /^\/hotelPrefs\/chains$/,
  /^\/hotelPrefs\/maxNightlyUsd$/,
  /^\/constraints\/maxTripDurationMinutes$/,
  /^\/constraints\/maxDoorToDoorMinutes$/,
];

export const isPatchPathAllowed = (path: string): boolean =>
  PATCHABLE_PATHS.some((pattern) => pattern.test(path));

const cloneState = (state: UserState): UserState =>
  JSON.parse(JSON.stringify(state)) as UserState;

const pathToSegments = (path: string): string[] => path.split('/').filter(Boolean);

const isNumericSegment = (segment: string): boolean => /^\d+$/.test(segment);

const resolveParent = (state: UserState, segments: string[]) => {
  let current: any = state;

  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i];
    if (isNumericSegment(segment)) {
      const index = Number(segment);
      if (!Array.isArray(current) || index >= current.length) {
        return { parent: undefined, key: undefined };
      }
      current = current[index];
      continue;
    }

    if (!(segment in current)) {
      return { parent: undefined, key: undefined };
    }
    current = current[segment];
  }

  const keySegment = segments[segments.length - 1];
  const key = isNumericSegment(keySegment) ? Number(keySegment) : keySegment;
  return { parent: current, key };
};

const resolveValue = (state: UserState, segments: string[]) => {
  let current: any = state;
  for (const segment of segments) {
    if (isNumericSegment(segment)) {
      const index = Number(segment);
      if (!Array.isArray(current) || index >= current.length) {
        return undefined;
      }
      current = current[index];
      continue;
    }

    if (!(segment in current)) {
      return undefined;
    }
    current = current[segment];
  }

  return current;
};

const validationError = (path: string | undefined, message: string, code = 'STATE_VALIDATION_FAILED'): ConstraintViolation => ({
  code,
  message,
  path,
});

const applyOperation = (state: UserState, op: PatchOp): ConstraintViolation | null => {
  if (!isPatchPathAllowed(op.path)) {
    return validationError(op.path, `Path ${op.path} is not patchable`, 'PATCH_PATH_NOT_ALLOWED');
  }

  const segments = pathToSegments(op.path);
  if (!segments.length) {
    return validationError(op.path, 'Empty patch path', 'PATCH_PATH_NOT_ALLOWED');
  }

  const { parent, key } = resolveParent(state, segments);

  if (parent === undefined || key === undefined) {
    return validationError(op.path, 'Unable to resolve patch path', 'PATCH_PATH_NOT_FOUND');
  }

  if (op.op === 'add') {
    const target = resolveValue(state, segments);
    if (!Array.isArray(target)) {
      return validationError(op.path, 'Add operations require array targets', 'PATCH_TARGET_NOT_ARRAY');
    }

    if (typeof key === 'number') {
      if (key < 0 || key > target.length) {
        return validationError(op.path, 'Array index out of bounds for add', 'PATCH_INDEX_INVALID');
      }
      target.splice(key, 0, op.value);
      return null;
    }

    target.push(op.value);
    return null;
  }

  if (op.op === 'set') {
    if (Array.isArray(parent) && typeof key === 'number') {
      if (key < 0 || key >= parent.length) {
        return validationError(op.path, 'Array index out of bounds for set', 'PATCH_INDEX_INVALID');
      }
      parent[key] = op.value;
      return null;
    }

    parent[key] = op.value;
    return null;
  }

  if (op.op === 'remove') {
    if (Array.isArray(parent) && typeof key === 'number') {
      if (key < 0 || key >= parent.length) {
        return validationError(op.path, 'Array index out of bounds for remove', 'PATCH_INDEX_INVALID');
      }
      parent.splice(key, 1);
      return null;
    }

    if (!(key in parent)) {
      return validationError(op.path, 'Property not found for removal', 'PATCH_PATH_NOT_FOUND');
    }

    delete parent[key];
    return null;
  }

  return validationError(op.path, 'Unsupported patch op', 'PATCH_OP_UNSUPPORTED');
};

export const applyStatePatch = (currentState: UserState, patch: StatePatch): PatchResult => {
  const workingCopy = cloneState(currentState);

  for (const op of patch.ops) {
    const error = applyOperation(workingCopy, op);
    if (error) {
      return { ok: false, errors: [error] };
    }
  }

  const validation = USER_STATE_SCHEMA.safeParse(workingCopy);
  if (!validation.success) {
    const errors: ConstraintViolation[] = validation.error.issues.map((issue) =>
      validationError(
        issue.path.length ? `/${issue.path.join('/')}` : undefined,
        issue.message,
        'STATE_VALIDATION_FAILED',
      ),
    );
    return { ok: false, errors };
  }

  return { ok: true, userState: validation.data };
};

export const validationErrorsFromIssues = (issues: any[]): ConstraintViolation[] =>
  issues.map((issue) =>
    validationError(
      issue.path?.length ? `/${issue.path.join('/')}` : undefined,
      issue.message ?? 'Invalid payload',
      'STATE_VALIDATION_FAILED',
    ),
  );

export { PATCHABLE_PATHS };
