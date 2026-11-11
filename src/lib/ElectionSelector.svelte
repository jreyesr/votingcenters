<script>
  import {elections} from "../elections";
  import TimelineRadio from "./TimelineRadio.svelte";

  let {value = $bindable()} = $props()
</script>

<div style="padding-bottom: 20px;">
    <TimelineRadio
            options={elections}
            color="gray"
            bind:value={value}
    />
</div>
