import { Operation } from './types';

export async function isAsyncOperation(operation: Operation): Promise<boolean> {
  const result = operation();
  if (result instanceof Promise ) {
    await result;

    return true;
  }

  return false;
}
