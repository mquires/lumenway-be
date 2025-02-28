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

interface DeactivateTemplateProps {
  token: string;
  metadata: SessionMetadata;
}

export const DeactivateTemplate = ({
  token,
  metadata,
}: DeactivateTemplateProps) => {
  const { location, device, ip } = metadata;

  return (
    <Html>
      <Head />
      <Preview>Account deactivation</Preview>
      <Tailwind>
        <Body className="max-w-2xl mx-auto p-6 bg-slate-50">
          <Section className="text-center mb-8">
            <Heading className="text-3xl text-black font-bold">
              Request to deactivate an account
            </Heading>
            <Text className="text-black text-base mt-2">
              You have initiated the process of deactivating your account in
              <b>Lumenway</b>.
            </Text>
          </Section>
          <Section className="bg-gray-100 rounded-lg p-6 text-center mb-6">
            <Heading className="text-2xl text-black font-semibold">
              Verification code:
            </Heading>
            <Heading className="text-3xl text-black font-semibold">
              {token}
            </Heading>
            <Text className="text-black">This code is valid for 5 minutes</Text>
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
