import { writable } from 'svelte/store';

import type { MessageList, LoadingState } from '$lib/helpers/types';

const loading_state = writable<LoadingState>('idle');

const message_list = writable<MessageList>([]);

const current_query = writable<string>('');

export { loading_state, message_list, current_query };
