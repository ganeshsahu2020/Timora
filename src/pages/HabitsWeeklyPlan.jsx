import React, { useEffect, useState } from 'react';
import {
  Box, Container, Heading, Text, VStack, HStack, Badge, Card, CardBody,
  useColorModeValue, Button, SimpleGrid, Icon
} from '@chakra-ui/react';
import { TimeIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { getPredictiveSchedule, getUserHabits } from '../services/dataStore';
import { FaClock } from 'react-icons/fa';

export default function HabitsWeeklyPlan() {
  const [schedule, setSchedule] = useState([]);
  const [habits, setHabits] = useState([]);
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    (async () => {
      const [s, h] = await Promise.all([getPredictiveSchedule(), getUserHabits()]);
      // fan out a simple 7-day plan repeating best window
      const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const week = days.map((d) => ({
        day: d,
        items: s.map(it => ({ ...it }))
      }));
      setHabits(h || []);
      setSchedule(week);
    })();
  }, []);

  return (
    <Container maxW="6xl" py={8}>
      <HStack justify="space-between" mb={6}>
        <Button as={RouterLink} to="/habits" leftIcon={<ChevronLeftIcon />} variant="outline">
          Back to Habits
        </Button>
        <Heading size="lg">Predictive Weekly Plan</Heading>
      </HStack>

      <Text color="gray.500" mb={6}>
        These time windows are suggested from your recent completion patterns.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {schedule.map((day) => (
          <Card key={day.day} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Heading size="md">{day.day}</Heading>
                  <Badge colorScheme="purple">{day.items.length} habits</Badge>
                </HStack>
                {day.items.map((it, i) => (
                  <HStack key={`${day.day}-${i}`} justify="space-between" p={3} border="1px solid" borderColor={borderColor} borderRadius="md">
                    <HStack><Icon as={FaClock} /><Text fontWeight="600">{it.habit}</Text></HStack>
                    <HStack>
                      <Badge colorScheme={it.confidence > 70 ? 'green' : 'orange'}>{it.confidence}% match</Badge>
                      <Text color="gray.600">{it.time}</Text>
                    </HStack>
                  </HStack>
                ))}
                <Button leftIcon={<TimeIcon />} variant="outline">Export This Plan</Button>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
