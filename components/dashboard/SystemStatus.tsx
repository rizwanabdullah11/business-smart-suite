import { COLORS } from "@/constant/colors"

export function SystemStatus() {
    return (
        <div className="mt-8">
            <div className="flex items-center gap-2">
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS.green500 }}
                ></div>
                <span
                    className="text-sm font-medium"
                    style={{ color: COLORS.textPrimary }}
                >
                    System status: Optimal
                </span>
            </div>
        </div>
    )
}
