import { testimonialsData } from "@/app/lib/data/landing-data";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function Testimonials() {
  const testimonialElements = testimonialsData.map((testimonial, index) => {
    return (
      <Card key={index} className="p-10 px-11 flex-1">
        <CardContent className="flex flex-col gap-[22px]">
          <div className="flex gap-4 items-center">
            <Image
              height={40}
              width={40}
              src={testimonial.image}
              alt={`profile pic of ${testimonial.image}`}
              className="h-10 w-10 rounded-full"
            ></Image>
            <div>
              <h3 className="font-semibold">{testimonial.name}</h3>
              <span className="text-sm text-gray-800">{testimonial.role}</span>
            </div>
          </div>
          <p className="text-gray-700">{testimonial.quote}</p>
        </CardContent>
      </Card>
    );
  });

  return (
    <section className="pt-15 px-4 pb-13 flex flex-col items-center gap-11">
      <h1 className="text-[31px] font-bold">What our Users Say</h1>
      <div className="flex gap-8">{testimonialElements}</div>
    </section>
  );
}
