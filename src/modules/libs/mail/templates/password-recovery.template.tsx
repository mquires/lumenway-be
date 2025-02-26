import type { SessionMetadata } from '@/src/shared/types/session-metadata.types';
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

interface PasswordRecoveryTemplateProps {
  domain: string;
  token: string;
  metadata: SessionMetadata;
}

export const PasswordRecoveryTemplate = ({
  domain,
  token,
  metadata,
}: PasswordRecoveryTemplateProps) => {
  const resetLink = `${domain}/account/recovery/${token}`;

  const { location, device, ip } = metadata;

  return (
    <Html>
      <Head />
      <Preview>Reset password</Preview>
      <Tailwind>
        <Body className="max-w-2xl mx-auto p-6 bg-slate-50">
          <Section className="text-center mb-8">
            <Heading className="text-3xl text-black font-bold">
              Reset password
            </Heading>
            <Text className="text-black text-base mt-2">
              You have requested a password reset for your account.
            </Text>
            <Text className="text-black text-base mt-2">
              To create a new password, click on the link below:
            </Text>
            <Link
              href={resetLink}
              className="inline-flex justify-center items-center rounded-full text-sm font-medium text-white bg-[#18B9AE] px-5 py-2"
            >
              Reset password
            </Link>
          </Section>
          <Section className="bg-gray-100 rounded-lg p-6 mb-6">
            <Heading className="text-xl font-semibold text-[#18B9AE]">
              Request information:
            </Heading>
            <ul className="list-disc list-inside mt-2 text-black">
              <li>
                Country: {location.country}, {location.city}
              </li>
              <li>OS: {device.os}</li>
              <li>Browser: {device.browser}</li>
              <li>IP: {ip}</li>
            </ul>
            <Text className="text-gray-600 mt-2">
              If you did not request a password change, please ignore this
              message!
            </Text>
          </Section>
          <Section className="text-center mt-8">
            <Text className="text-gray-600">
              If you have any questions, you can contact our support team{' '}
              <Link
                href="mailto:help@lumenway.com"
                className="text-[#18b9ae] underline"
              >
                help@lumenway.com
              </Link>
            </Text>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
};
