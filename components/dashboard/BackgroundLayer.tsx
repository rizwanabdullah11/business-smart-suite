import { COLORS } from "@/constant/colors"

export function BackgroundLayer() {
    return (
        <div
            className="absolute inset-0"
            style={{
                background: COLORS.bgWhite
            }}
        />
    )
}
