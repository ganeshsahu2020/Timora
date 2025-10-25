// src/components/Shell.jsx
import { Box, Grid, GridItem, useBreakpointValue } from '@chakra-ui/react';

export default function Shell({ aside, children }) {
  const cols = useBreakpointValue({ base: '1fr', md: '1fr', lg: '320px 1fr' });
  const areas = useBreakpointValue({
    base: `"main"`,
    md: `"main"`,
    lg: `"aside main"`,
  });

  return (
    <Grid
      templateColumns={cols}
      templateAreas={areas}
      gap={{ base: 4, md: 6, lg: 8 }}
      px={{ base: 4, md: 8 }}
      pt={{ base: 20, md: 24 }}
      pb={{ base: 16, md: 20 }}
      alignItems="start"
    >
      {/* Sticky aside on lg+; naturally stacks on mobile */}
      {aside && (
        <GridItem
          area="aside"
          position={{ base: 'static', lg: 'sticky' }}
          top={{ lg: 88 }}
          alignSelf="start"
        >
          <Box as="nav" aria-label="Page sections">
            {aside}
          </Box>
        </GridItem>
      )}

      <GridItem area="main">
        {children}
      </GridItem>
    </Grid>
  );
}
