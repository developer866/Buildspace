'use client';

import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Box, Flex, Text, chakra, Button, Menu, Portal } from '@chakra-ui/react';

// Wraps next/link so it accepts Chakra style props directly
const ChakraLink = chakra(NextLink);

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/login');
  };

  if (loading) {
    return <Box h="16" borderBottomWidth="1px" borderColor="gray.200" bg="white" />;
  }

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      px={6}
      py={4}
      borderBottomWidth="1px"
      borderColor="gray.200"
      bg="white"
    >
      <Flex align="center" gap={6}>
        <Text fontWeight="semibold" color="gray.900">
          Buildspace
        </Text>

        <ChakraLink href="/" fontSize="sm" fontWeight="medium" color="gray.600" _hover={{ color: 'gray.900' }}>
          Home
        </ChakraLink>

        <ChakraLink href="/about" fontSize="sm" fontWeight="medium" color="gray.600" _hover={{ color: 'gray.900' }}>
          About
        </ChakraLink>

        {/* Projects dropdown */}
        <Menu.Root navigate={({ value }) => router.push(value)}>
          <Menu.Trigger asChild>
            <Button variant="ghost" size="sm" fontWeight="medium" color="gray.600" px={2}>
              Projects ▾
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content minW="12rem">
                <ChakraLink href="/projects/completed" px={3} pt={2} pb={1} fontSize="xs" fontWeight="bold" color="green.400" textTransform="uppercase">
                  Completed
                </ChakraLink>

                <Menu.Separator />

                <ChakraLink href="/projects/in-progress" px={3} pt={2} pb={1} fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">
                  In - progress
                </ChakraLink>

                <Menu.Separator />

                <ChakraLink href="/projects/abandoned" px={3} pt={2} pb={1} fontSize="xs" fontWeight="bold" color="red.400" textTransform="uppercase" _hover={{ color: 'green.600' }}>
                  Abandoned
                </ChakraLink>
              
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>

        <ChakraLink href="/logs" fontSize="sm" fontWeight="medium" color="gray.600" _hover={{ color: 'gray.900' }}>
          Logs
        </ChakraLink>
      </Flex>

      <Flex align="center" gap={4}>
        {user ? (
          <Button variant="ghost" size="sm" color="gray.600" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <>
            <ChakraLink href="/login" fontSize="sm" fontWeight="medium" color="gray.600" _hover={{ color: 'gray.900' }}>
              Login
            </ChakraLink>
            <ChakraLink
              href="/signup"
              fontSize="sm"
              fontWeight="medium"
              bg="gray.900"
              color="white"
              px={4}
              py={2}
              borderRadius="lg"
              _hover={{ bg: 'gray.800' }}
            >
              Sign up
            </ChakraLink>
          </>
        )}
      </Flex>
    </Flex>
  );
}