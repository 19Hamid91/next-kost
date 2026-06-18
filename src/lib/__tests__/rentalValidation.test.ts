import { describe, it } from 'vitest';

describe('checkRoomOverlap', () => {
  it.todo('should detect overlap when new rental starts before existing ends');
  it.todo('should allow booking on the day after existing rental ends');
  it.todo('should skip the current rental when editing');
});

describe('checkTenantOverlap', () => {
  it.todo('should block tenant from having two active rentals simultaneously');
});
