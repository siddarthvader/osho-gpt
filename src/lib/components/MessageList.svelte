<script lang="ts">
	import { message_list, loading_state } from '$lib/store';
	import { Cpu, User2 } from 'lucide-svelte';
	import Loading from '$components/Loading.svelte';
	import Button from './ui/button/Button.svelte';

	$: loading = $loading_state === 'loading';
	$: streaming = $loading_state === 'streaming';

	$: {
		console.log($message_list);
	}
</script>

<div class="flex-1 flex flex-col overflow-auto">
	{#each $message_list as message, index}
		<div
			class={`flex flex-col p-4 text-sm border-b-2 ${
				message.type === 'apiMessage' && index === $message_list.length - 1 && streaming
					? 'border-yellow-400 blinking'
					: 'border-transparent'
			}`}
			class:bg-secondary={message.type === 'apiMessage'}
			class:bg-white={message.type === 'userMessage'}
		>
			<div class="flex items-start w-full">
				{#if message.type === 'userMessage'}
					<User2 class="w-5 h-5 mr-2" />
				{:else}
					<Cpu class="w-5 h-5 mr-2" />
				{/if}

				<div class={`flex flex-col w-full`}>
					{message.message}
				</div>
			</div>
			<div class="flex flex-col ml-4">
				{#if message.metadata?.length}
					<div
						class="py-1 mt-3 text-sm font-bold tracking-tight transition-colors border-t text-neutral-400"
					>
						Verified Sources
					</div>
				{/if}
				<div class="flex space-x-2">
					{#each [...new Set(message?.metadata?.map((meta) => meta.source))].slice(0, 4) as meta, dindex}
						<a
							target="_blank"
							class="text-primary hover:text-orange-600 hover:underline no-underline max-w-[200px] py-1 overflow-hidden truncate"
							href={meta}
						>
							{dindex + 1}. {meta}
						</a>
					{/each}
				</div>
			</div>
		</div>
	{/each}
	{#if loading}
		<Loading />
	{/if}
</div>
