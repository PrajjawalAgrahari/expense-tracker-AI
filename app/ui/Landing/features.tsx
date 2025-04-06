import { featuresData } from "@/app/lib/data/landing-data";
import { Card, CardContent } from "@/components/ui/card";

export default function Features() {
  const featuresCard = featuresData.map((feature, index) => {
    return (
      <Card key={index} className="p-6 py-9">
        <CardContent className="flex flex-col gap-4">
          {feature.icon}
          <h2 className="text-xl font-semibold">{feature.title}</h2>
          <p className="text-gray-700">{feature.description}</p>
        </CardContent>
      </Card>
    );
  });

  return (
    <section className="pt-15 pb-13 px-5 flex flex-col items-center gap-15">
      <h1 className="text-[31px] font-bold">
        Everything you need to manage your finances
      </h1>
      <div className="grid grid-cols-3 gap-8">{featuresCard}</div>
    </section>
  );
}
