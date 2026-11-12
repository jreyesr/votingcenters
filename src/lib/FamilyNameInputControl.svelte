<script lang="ts">
    import {Control} from "svelte-maplibre";

    let {familyName = $bindable<string>(), kind = $bindable<"F" | "M">()} = $props()
</script>
<Control>
    <div class="container">
        <input type="text" placeholder="Apellido a localizar" bind:value={() => familyName?.toUpperCase() ?? "", (v) => familyName = v.toUpperCase()}>

        <div class="suffix">
            <label><input type="radio" bind:group={kind} value="F">F</label>
            <label><input type="radio" bind:group={kind} value="M">M</label>
        </div>
    </div>
</Control>

<style>
    div.container > div.suffix {
        position: absolute;
        display: inline;
        right: 0;
        top: 0;
        bottom: 0;
        align-content: center;
        margin-right: .5em;
    }

    input[type="text"] {
        padding: .3em;
        width: 80px;
        opacity: 50%;

        &:focus {
            width: unset;
            opacity: unset;
        }
    }

    input[type="radio"] {
        position: absolute;
        display: none;
    }

    label:has(input[type="radio"]) {
        cursor: pointer;
    }

    label:has(input:checked) {
        font-weight: bolder;
        text-decoration: underline;
        font-size: 1.2em;
        color: dodgerblue;
        text-decoration-inset: -.1rem;
    }
</style>
