import { COLORS } from "@/constant/colors"

export function SystemStatus() {
    return (
        <div className="mt-12">
            <div className="flex items-center gap-3">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.green500 }}
                ></div>
                <span
                    className="text-base font-semibold"
                    style={{ color: COLORS.textPrimary }}
                >
                    System status: Optimal
                </span>
            </div>
        </div>
    )
}
