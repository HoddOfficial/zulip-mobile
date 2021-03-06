import deepFreeze from 'deep-freeze';

import { getCurrentTypingUsers } from '../typingSelectors';
import { homeNarrow, privateNarrow, groupNarrow } from '../../utils/narrow';

describe('getCurrentTypingUsers', () => {
  test('return undefined when current narrow is not private or group', () => {
    const state = deepFreeze({
      accounts: [{}],
      chat: {
        narrow: homeNarrow,
      },
    });

    const typingUsers = getCurrentTypingUsers(state);

    expect(typingUsers).toEqual(undefined);
  });

  test('when in private narrow and the same user is typing return details', () => {
    const expectedUser = {
      id: 1,
      email: 'john@example.com',
      avatarUrl: 'http://example.com/avatar.png',
      fullName: 'John Doe',
    };
    const state = deepFreeze({
      accounts: [{ email: 'me@example.com' }],
      chat: {
        narrow: privateNarrow('john@example.com'),
      },
      typing: {
        'john@example.com': [1],
      },
      users: [expectedUser],
    });

    const typingUsers = getCurrentTypingUsers(state);

    expect(typingUsers).toEqual([expectedUser]);
  });

  test('when two people are typing, return details for all of them', () => {
    const user1 = {
      id: 1,
      email: 'john@example.com',
      avatarUrl: 'http://example.com/avatar1.png',
      fullName: 'John Doe',
    };
    const user2 = {
      id: 2,
      email: 'mark@example.com',
      avatarUrl: 'http://example.com/avatar2.png',
      fullName: 'Mark Dark',
    };
    const state = deepFreeze({
      accounts: [{ email: 'me@example.com' }],
      chat: {
        narrow: groupNarrow(['john@example.com', 'mark@example.com']),
      },
      typing: {
        'john@example.com,mark@example.com': [1, 2],
      },
      users: [user1, user2],
    });

    const typingUsers = getCurrentTypingUsers(state);

    expect(typingUsers).toEqual([user1, user2]);
  });

  test('when in private narrow but different user is typing return undefined', () => {
    const state = deepFreeze({
      accounts: [{ email: 'me@example.com' }],
      chat: {
        narrow: privateNarrow('mark@example.com'),
      },
      typing: {
        'john@example.com': [1],
      },
    });

    const typingUsers = getCurrentTypingUsers(state);

    expect(typingUsers).toEqual(undefined);
  });

  test('when in group narrow and someone is typing in that narrow return details', () => {
    const expectedUser = {
      id: 1,
      email: 'john@example.com',
      avatarUrl: 'http://example.com/avatar.png',
      fullName: 'John Doe',
    };
    const state = deepFreeze({
      accounts: [{ email: 'me@example.com' }],
      chat: {
        narrow: groupNarrow(['mark@example.com', 'john@example.com']),
      },
      typing: {
        'john@example.com,mark@example.com': [1],
      },
      users: [expectedUser],
    });

    const typingUsers = getCurrentTypingUsers(state);

    expect(typingUsers).toEqual([expectedUser]);
  });
});
