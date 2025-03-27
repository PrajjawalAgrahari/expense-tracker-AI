import { statsData } from "@/app/lib/landing-data";

export default function Stats() {
    const statsElement = statsData.map((stat, index) => {
        return (
            <div key={index} className="flex flex-col items-center gap-2">
                <span className="text-4xl font-bold text-blue-600">{stat.value}</span>
                <span className="text-gray-600 text-center
                  flex justify-center">{stat.label}</span>
            </div>
        )
    })
    return (
        <section className="flex justify-center gap-40 py-21 bg-[#EFF6FF]">
            {statsElement}
        </section>
    )
}