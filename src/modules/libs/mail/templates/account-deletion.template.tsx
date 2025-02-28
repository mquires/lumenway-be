import {
  Body,
  Head,
  Heading,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { Html } from '@react-email/html';
import * as React from 'react';

interface AccountDeletionTemplateProps {
  domain: string;
}

export const AccountDeletionTemplate = ({
  domain,
}: AccountDeletionTemplateProps) => {
  const registerLink = `${domain}/account/create`;

  return (
    <Html>
      <Head />
      <Preview>Account deleted</Preview>
      <Tailwind>
        <Body className="max-w-2xl mx-auto p-6 bg-slate-50">
          <Section className="text-center">
            <Heading className="text-3xl text-black font-bold">
              Your account was successfully removed
            </Heading>
            <Text className="text-black text-base mt-2">
              Your account and all data in Lumenway has been completely deleted
            </Text>
          </Section>
          <Section className="bg-white text-black text-center rounded-lg p-6 shadow-md mb-4 ">
            <Text>
              You will no longer receive notifications in Telegram and email
            </Text>
            <Text>
              If you decide to come back to us, you can register using the
              following link:
            </Text>
            <Link
              href={registerLink}
              className="inline-flex justify-center items-center rounded-md mt-2 text-sm font-medium text-white bg-[#18B9AE] px-5 py-2 rounded-fill"
            >
              Register in Lumenway
            </Link>
          </Section>
          <Section className="text-center text-black">
            <Text>
              Thank you for being with us! We are always glad to have you back!
            </Text>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
};
