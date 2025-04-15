import * as React from "react";
import {
  Html,
  Head,
  Body,
  Preview,
  Container,
  Heading,
  Text,
  Section,
  Tailwind,
} from "@react-email/components";

export function Email({
  name,
  budgetAmount,
  spentSoFar,
  remaining,
  percentageUsed,
}: {
  name: string | null;
  budgetAmount: number;
  spentSoFar: number;
  remaining: number;
  percentageUsed: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Budget Alert</Preview>
      <Tailwind>
        <Body>
          <Container>
            <Heading className="text-center">Budget Alert</Heading>
            <Text>Hello {name},</Text>
            <Text>You have used {percentageUsed}% of your monthly budget.</Text>
            <Section className="flex flex-col mt-4 p-4 rounded-lg shadow-md bg-gray-100">
              <div className="bg-white w-full">
                <Text>Budget Amount</Text>
                <Text>${budgetAmount}</Text>
              </div>
              <div className="bg-white w-[100%]">
                <Text>Spent So Far</Text>
                <Text>${spentSoFar}</Text>
              </div>
              <div className="bg-white w-[100%]">
                <Text>Remaining</Text>
                <Text>${remaining?.toFixed(2)}</Text>
              </div>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default Email;
