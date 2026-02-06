export const SPACING = {
    // Gap Spacing
    gap2: "0.5rem",    // gap-2
    gap4: "1rem",      // gap-4
    gap6: "1.5rem",    // gap-6
    gap12: "3rem",     // gap-12

    // Padding
    p4: "1rem",        // p-4
    p8: "2rem",        // p-8
    pb5: "1.25rem",    // pb-5
    pt4: "1rem",       // pt-4
    py12: "3rem",      // py-12
    px4: "1rem",       // px-4

    // Margin
    mt0_5: "0.125rem", // mt-0.5
    mt1: "0.25rem",    // mt-1
    mt1_5: "0.375rem", // mt-1.5

    // Border Radius
    rounded2xl: "1rem",      // rounded-2xl
    roundedXl: "0.75rem",    // rounded-xl

    // Width/Height
    h1: "0.25rem",     // h-1
    h14: "3.5rem",     // h-14
    w14: "3.5rem",     // w-14

    // Max Width
    maxWMd: "28rem",   // max-w-md

    // Min Height
    minHScreen: "100vh", // min-h-screen
} as const;

// Tailwind class mappings for reference
export const SPACING_CLASSES = {
    gap: {
        2: "gap-2",
        4: "gap-4",
        6: "gap-6",
        12: "gap-12",
    },
    padding: {
        4: "p-4",
        8: "p-8",
        pb5: "pb-5",
        pt4: "pt-4",
    },
    margin: {
        mt0_5: "mt-0.5",
        mt1: "mt-1",
        mt1_5: "mt-1.5",
    },
} as const;
