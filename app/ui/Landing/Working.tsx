import { howItWorksData } from "@/app/lib/landing-data"
import { Card, CardContent } from "@/components/ui/card"

export default function HowItWorks() {

    const workElements = howItWorksData.map((work, index) => {
        return (
            <Card key={index} className="p-6 py-9 bg-blue-50 border-none shadow-none flex-1">
                <CardContent className="flex flex-col gap-[22px] items-center">
                    <div className="h-[63px] w-[63px] rounded-full bg-[#DBEAFE] flex justify-center items-center">
                        {work.icon}
                    </div>
                    <h2 className="text-xl font-semibold">{work.title}</h2>
                    <p className="text-gray-700 text-center">{work.description}</p>
                </CardContent>
            </Card>
        )
    })

    return (
        <section className="pt-15 pb-10 flex flex-col items-center gap-8 bg-blue-50">
            <h1 className="text-[31px] font-bold">How It Works</h1>
            <div className="flex">
                {workElements}
            </div>
        </section>
    )
}