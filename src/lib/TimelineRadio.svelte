<script lang="ts">
    let {color = "black", options = [], value = $bindable()}: {
        // name: string,
        color: string
        options: { value: string, label: string, disabled?: true }[],
        value: string
    } = $props()

    const name = $props.id()
</script>

<style>
    /* Based on https://codepen.io/brandonmcconnell/pen/Zqjdmg
    then changed so it doesn't require SCSS and the selected option is denoted slightly differently
     */

    @media (max-width: 992px) {
        .slider input:not(:checked) + label::before {
            content: ""
        }
    }

    .slider {
        display: flex;
        flex-direction: row;
        align-content: stretch;
        position: relative;
        width: 100%;
        height: 50px;
        user-select: none;
        margin-bottom: 15px;

        /* the line that joins the options */

        &::before {
            content: " ";
            position: absolute;
            height: 2px;
            width: calc(100% * ((var(--num-options) - 1) / var(--num-options)));
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--color);
        }

        input, label {
            box-sizing: border-box;
            flex: 1;
            user-select: none;
            cursor: pointer;
        }

        label {
            display: inline-block;
            position: relative;
            width: 20%;
            height: 100%;
            user-select: none;

            /* text of each label */

            &::before {
                content: attr(data-text);
                position: absolute;
                left: 50%;
                padding-top: 5px;
                transform: translate(-50%, 45px);
                font-size: 14px;
                /*letter-spacing: 0.4px;*/
                font-weight: 400;
                opacity: 0.85;
                text-wrap: nowrap;
                transition: all 0.15s ease-in-out;
                color: var(--color);
                max-width: 100%;
                text-align: center;
            }

            &:last-child::before {
                text-align: end;
            }

            /* the empty circle for each option */

            &::after {
                content: " ";
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 30px;
                height: 30px;
                border: 2px solid var(--color);
                background: white;
                border-radius: 50%;
                pointer-events: none;
                user-select: none;
                outline: 0 solid var(--color);
                z-index: 1;
                cursor: pointer;
                transition: all .15s ease-in-out;
            }

            &[data-disabled]::after {
                background: repeating-linear-gradient(-45deg, transparent, transparent 45%, var(--color) 45%, var(--color) 55%, transparent 55%, transparent 100%),
                repeating-linear-gradient(45deg, white, white 45%, var(--color) 45%, var(--color) 55%, white 55%, white 100%);
                width: 20px;
                height: 20px;
            }

            /* slight zoom-in while hovering an option that isn't selected */

            &:not([data-disabled]):hover::after {
                transform: translate(-50%, -50%) scale(1.25);
            }

            &[data-disabled] {
                cursor: not-allowed;
            }
        }

        input {
            display: none;

            &:checked {
                /* bold the selected label */

                + label::before {
                    font-weight: 800;
                    opacity: 1;
                }

                /* fill the selected circle and add another circle around it */

                + label:not([data-disabled])::after {
                    /*border-width: 8px;*/
                    background: var(--color);
                    outline-width: 10px;
                    border-width: 0;
                    outline-offset: 10px;
                    transform: translate(-50%, -50%) scale(0.5);
                    transition: all .15s ease-in-out;
                }
            }
        }
    }
</style>

<div class="slider" style:--color={color} style:--num-options={options.length}>
    {#each options as option, i}
        {@const optionId = name + "-" + i}
        <input
                type="radio" name={name}
                id={optionId} value={option.value}
                required disabled={option.disabled}
                bind:group={value}
        />
        <label
                for={optionId}
                data-text={option.label}
                data-disabled={option.disabled}
        ></label>
    {/each}
</div>
