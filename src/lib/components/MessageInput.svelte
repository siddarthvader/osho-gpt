<script lang="ts">
	import { isValidJSON } from '$lib/helpers/util';
	import { current_query, loading_state, message_list } from '$lib/store';
	import Button from './ui/button/Button.svelte';

	import { Loader2, Send } from 'lucide-svelte';
	let currentQuery = '';

	$: loading = $loading_state === 'loading';

	async function onQueryChange(event) {
		currentQuery = event.target.value;
		current_query.set(currentQuery);
	}

	async function onKeyUp(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			submitQuery();
		}
	}

	async function submitQuery() {
		try {
			loading_state.set('loading');
			currentQuery = '';
			message_list.set([
				...$message_list,
				{
					type: 'userMessage',
					message: $current_query,
					metadata: []
				}
			]);
			const streamIndex = $message_list.length;

			const response = await fetch('/api/chat-stream', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					question: $current_query,
					history: $message_list
				})
			});

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			loading_state.set('streaming');

			message_list.set([
				...$message_list,
				{
					type: 'apiMessage',
					message: '',
					metadata: []
				}
			]);

			while (true) {
				const { done, value } = await reader?.read();

				if (done) {
					break;
				}
				const chunk = decoder.decode(value);

				console.log({ chunk });

				const isJSON = isValidJSON(chunk);

				if (isJSON) {
					const parsedValue = JSON.parse(chunk);
					console.log({ parsedValue });
					$message_list[streamIndex]['metadata'] = parsedValue['metadata'];
				} else {
					$message_list[streamIndex]['message'] += chunk.toString();
				}
			}
		} catch (e) {
			console.error(e);
		} finally {
			loading_state.set('idle');
		}
	}
</script>

<div
	class="relative flex items-center w-full p-2 mt-1 mb-6 space-x-0 border-2 divide-x-2 border-secondary"
>
	<input
		class="flex w-full h-full p-2 outline-none"
		type="text"
		placeholder={'Talk to Osho...'}
		value={currentQuery}
		on:change={onQueryChange}
		on:keyup={onKeyUp}
	/>
	<Button class="bg-[#c4aa47]" on:click={submitQuery}>
		{#if loading}
			<Loader2 class="inline w-5 h-5 mr-2 text-white animate-spin" />
		{:else}
			<Send class="inline w-5 h-5 mr-2 text-white" />
		{/if}
	</Button>
</div>
