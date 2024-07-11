

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ExpandMore as ExpandMoreIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Router as RouterIcon,
  Backup as BackupIcon,
  DevicesOther as DevicesOtherIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Grid,
  Paper,
  Select,
  MenuItem,
  InputBase,
  IconButton,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';

import SpecificationsDialog from './reusable/SpecificationsDialog';

const componentIcons = {
  1: <StorageIcon />,
  2: <MemoryIcon />,
  3: <RouterIcon />,
  4: <BackupIcon />,
  5: <DevicesOtherIcon />,
};

const componentTypes = {
  1: 'Server',
  2: 'Storage',
  3: 'Switch',
  4: 'Tape Drive',
  5: 'Other'
};

const componentColors = {
  1: '#4caf50', // green
  2: '#2196f3', // blue
  3: '#ff9800', // orange
  4: '#9c27b0', // purple
  5: '#607d8b', // blue-grey
};

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Report = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [components, setComponents] = useState([]);
  const [filteredComponents, setFilteredComponents] = useState({});
  const [dataCenters, setDataCenters] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    vendor: '',
    dataCenter: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isAdmin] = useState(window.localStorage.getItem("isAdmin") === "true");

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  useEffect(() => {
    if (components.length > 0) {
      applyFilters();
    }
  }, [components, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [componentsRes, dataCentersRes, vendorsRes] = await Promise.all([
        axios.get('/general/components'),
        axios.get('/general/data-centers'),
        axios.get('/general/vendors')
      ]);
      setComponents(componentsRes.data);
      setDataCenters(dataCentersRes.data);
      setVendors(vendorsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const groupedByRack = components.reduce((acc, component) => {
      const rackName = component.rackId.name;
      if (!acc[rackName]) {
        acc[rackName] = [];
      }
      acc[rackName].push(component);
      return acc;
    }, {});

    const filtered = Object.entries(groupedByRack).reduce((acc, [rackName, rackComponents]) => {
      const filteredRackComponents = rackComponents.filter(component => {
        return (
          (!filters.type || component.type.toString() === filters.type) &&
          (!filters.vendor || component.specifications.vendorID._id === filters.vendor) &&
          (!filters.dataCenter || component.dataCenterId === filters.dataCenter) &&
          (!filters.search || component.name.toLowerCase().includes(filters.search.toLowerCase()))
        );
      });

      if (filteredRackComponents.length > 0) {
        acc[rackName] = filteredRackComponents;
      }

      return acc;
    }, {});

    setFilteredComponents(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleComponentClick = (component) => {
    setSelectedComponent(component);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedComponent(null);
  };



  const handleComponentSave = async (updatedComponent) => {
    try {
      await axios.put(`/general/components/${updatedComponent._id}`, updatedComponent);
      setRefreshTrigger(prev => prev + 1);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error updating component:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>


      {loading && <LinearProgress color="secondary" />}

      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <Select
                fullWidth
                value={filters.type}
                onChange={handleFilterChange}
                name="type"
                displayEmpty
              >
                <MenuItem value="">All Types</MenuItem>
                {Object.entries(componentTypes).map(([key, value]) => (
                  <MenuItem key={key} value={key}>{value}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Select
                fullWidth
                value={filters.vendor}
                onChange={handleFilterChange}
                name="vendor"
                displayEmpty
              >
                <MenuItem value="">All Vendors</MenuItem>
                {vendors.map(vendor => (
                  <MenuItem key={vendor._id} value={vendor._id}>{vendor.vendorName}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Select
                fullWidth
                value={filters.dataCenter}
                onChange={handleFilterChange}
                name="dataCenter"
                displayEmpty
              >
                <MenuItem value="">All Data Centers</MenuItem>
                {dataCenters.map(dc => (
                  <MenuItem key={dc._id} value={dc._id}>{dc.name}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                component="form"
                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
              >
                <StyledInputBase
                  placeholder="Search Components"
                  inputProps={{ 'aria-label': 'search components' }}
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
                <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {!loading && Object.keys(filteredComponents).length === 0 ? (
          <Typography variant="h6" align="center" sx={{ mt: 4 }}>
            No components found matching the current filters.
          </Typography>
        ) : (
          Object.entries(filteredComponents).map(([rackName, rackComponents]) => (
            <Accordion key={rackName} sx={{ mb: 2 }} defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${rackName}-content`}
                id={`panel-${rackName}-header`}
                sx={{ backgroundColor: '#800000', color: 'white' }}
              >
                <Typography variant="h6">{rackName}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {rackComponents.sort((a, b) => a.startSlot - b.startSlot).map(component => (
                    <Grid item xs={12} sm={6} md={4} key={component._id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: 6,
                            transform: 'scale(1.02)',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                        onClick={() => handleComponentClick(component)}
                      >
                        <CardContent>
                          <Typography variant="h6" component="h4" gutterBottom>
                            {component.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {componentIcons[component.type]}
                            <Chip
                              label={componentTypes[component.type] || component.type}
                              size="small"
                              sx={{
                                ml: 1,
                                backgroundColor: componentColors[component.type],
                                color: 'white',
                              }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Slot: {component.startSlot}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Slots Occupied: {component.size}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>

      {selectedComponent && (
        <SpecificationsDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          componentDetails={selectedComponent}
          color={componentColors[selectedComponent.type]}
          label={componentTypes[selectedComponent.type]}
          isAdmin={isAdmin}
          onSave={handleComponentSave}
        />
      )}
    </Box>
  );
};

export default Report;