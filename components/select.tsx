"use client";

import { useMemo } from "react";
import { SingleValue } from "react-select";
import CreateableSelect from "react-select/creatable";

type Props = {
    onChange: (value?: string) => void;
    onCreate: (value: string) => void;
    options?: { label: string; value: string }[];
    value?: string | null | undefined;
    disabled?: boolean;
    placeholder?: string;
};

export const Select = ({
    value,
    onChange,
    disabled,
    onCreate,
    options = [],
    placeholder,
}: Props) => {
    const onSelect = (
        option: SingleValue<{ label: string; value: string }>
    ) => {
        onChange(option?.value);
    };

    const formattedValue = useMemo(() => {
        return options.find((option) => option.value === value);
    }, [options, value]);
    
    return (
        <CreateableSelect
            className="text-sm"
            styles={{
                control: (base, state) => ({
                    ...base,
                    minHeight: "2.5rem",
                    backgroundColor: "hsl(0 0% 100%)",
                    borderColor: state.isFocused ? "hsl(262.1 83.3% 57.8%)" : "hsl(220 13% 91%)",
                    borderRadius: "0.5rem",
                    boxShadow: state.isFocused
                        ? "0 0 0 3px hsla(262.1, 83.3%, 57.8%, 0.15)"
                        : "none",
                    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                    ":hover": {
                        borderColor: state.isFocused
                            ? "hsl(262.1 83.3% 57.8%)"
                            : "hsl(262.1 83.3% 75%)",
                    },
                }),
                placeholder: (base) => ({
                    ...base,
                    color: "hsl(220 8.9% 60%)",
                    fontSize: "0.875rem",
                }),
                singleValue: (base) => ({
                    ...base,
                    color: "hsl(224 71.4% 4.1%)",
                    fontSize: "0.875rem",
                }),
                input: (base) => ({
                    ...base,
                    color: "hsl(224 71.4% 4.1%)",
                    fontSize: "0.875rem",
                }),
                menu: (base) => ({
                    ...base,
                    backgroundColor: "hsl(0 0% 100%)",
                    borderRadius: "0.5rem",
                    border: "1px solid hsl(220 13% 91%)",
                    boxShadow: "0 8px 24px -4px hsla(262.1, 83.3%, 57.8%, 0.12), 0 2px 8px -2px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                }),
                menuList: (base) => ({
                    ...base,
                    padding: "0.25rem",
                }),
                option: (base, state) => ({
                    ...base,
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    padding: "0.4rem 0.75rem",
                    backgroundColor: state.isSelected
                        ? "hsl(262.1 83.3% 57.8%)"
                        : state.isFocused
                        ? "hsla(262.1, 83.3%, 57.8%, 0.1)"
                        : "transparent",
                    color: state.isSelected
                        ? "hsl(210 20% 98%)"
                        : "hsl(224 71.4% 4.1%)",
                    cursor: "pointer",
                    transition: "background-color 0.1s ease",
                    ":active": {
                        backgroundColor: "hsla(262.1, 83.3%, 57.8%, 0.2)",
                    },
                }),
                indicatorSeparator: (base) => ({
                    ...base,
                    backgroundColor: "hsl(220 13% 91%)",
                }),
                dropdownIndicator: (base, state) => ({
                    ...base,
                    color: state.isFocused ? "hsl(262.1 83.3% 57.8%)" : "hsl(220 8.9% 60%)",
                    transition: "color 0.15s ease, transform 0.2s ease",
                    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
                    ":hover": {
                        color: "hsl(262.1 83.3% 57.8%)",
                    },
                }),
                clearIndicator: (base) => ({
                    ...base,
                    color: "hsl(220 8.9% 60%)",
                    ":hover": {
                        color: "hsl(0 84.2% 60.2%)",
                    },
                }),
            }}
            placeholder={placeholder}
            value={formattedValue}
            onChange={onSelect}
            options={options}
            onCreateOption={onCreate}
            isDisabled={disabled}
        />
    )
};