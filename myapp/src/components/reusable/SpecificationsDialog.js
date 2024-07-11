import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { FaArrowRight } from 'react-icons/fa';

const SpecificationsDialog = ({
  open,
  onClose,
  componentDetails,
  color,
  label,
  isAdmin,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComponent, setEditedComponent] = useState({});
  const [isChanged, setIsChanged] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [vendorValue, setVendorValue] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (componentDetails.specifications.vendorID) {
      const vendor = componentDetails.specifications.vendorID;
      setVendorValue(`${vendor.vendorID[0]}(${vendor.vendorName})`);
      
    }
    setEditedComponent(JSON.parse(JSON.stringify(componentDetails)));
  }, [componentDetails]);

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/general/vendors');
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    setIsChanged(false);
    setShowChanges(false);
    onClose();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setShowChanges(true);
  };

  const confirmSave = async () => {
    try {
      setIsEditing(false);
      setIsChanged(false);
      setShowChanges(false);

      const updatedComponent = {
        ...editedComponent,
        specifications: {
          ...editedComponent.specifications,
          vendorID: editedComponent.specifications.vendorID._id
        },
        customFields: editedComponent.customFields,
      };

      const response = await axios.put(`/admin/edit-component/${editedComponent._id}`, {
        specifications: updatedComponent.specifications,
        customFields: updatedComponent.customFields
      });

      if (response.status === 200) {
        console.log('Component updated successfully');
      } else {
        throw new Error('Failed to update component');
      }

      handleClose();
      onSave();
    } catch (error) {
      console.error('Error updating component:', error);
    }
  };

  const handleInputChange = (key, value, vendorId = null) => {
    setEditedComponent(prev => {
      const updated = JSON.parse(JSON.stringify(prev));

      if (vendorId) {
        const matches = value.match(/^(.+?)\((.+?)\)$/);
        if (matches) {
          setVendorValue(value);
          updated.specifications.vendorID = {
            _id: vendorId,
            vendorName: matches[2],
            vendorID: [matches[1]],
          };
        }
      } else {
        const originalValue = componentDetails.specifications[key];
        let typedValue = value;

        if (typeof originalValue === 'number' && !isNaN(Number(value))) {
          typedValue = Number(value);
        } else if (typeof originalValue === 'boolean') {
          typedValue = value === 'true' || value === true;
        }

        updated.specifications[key] = typedValue;
      }

      const hasChanged = isObjectChanged(updated, componentDetails);
      setIsChanged(hasChanged);

      return updated;
    });
  };

  const handleCustomFieldChange = (index, value) => {
    setEditedComponent(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.customFields[index].value = value;

      const hasChanged = isObjectChanged(updated, componentDetails);
      setIsChanged(hasChanged);

      return updated;
    });
  };

  const isObjectChanged = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return true;
    }

    for (const key of keys1) {
      const val1 = obj1[key];
      const val2 = obj2[key];
      const areObjects = isObject(val1) && isObject(val2);

      if (
        (areObjects && isObjectChanged(val1, val2)) ||
        (!areObjects && val1 !== val2)
      ) {
        return true;
      }
    }

    return false;
  };

  const isObject = (object) => {
    return object != null && typeof object === 'object';
  };

  const renderComparisonField = (label, oldValue, newValue, key) => {
    if (oldValue === newValue) return null;
    return (
      <React.Fragment key={key}>
        <Grid item xs={4}>
          <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="body2">{oldValue}</Typography>
        </Grid>
        <Grid item xs={1}>
          <FaArrowRight />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body2" color="primary" textAlign={'center'}>{newValue}</Typography>
        </Grid>
      </React.Fragment>
    );
  };
  
  let component = isEditing ? editedComponent : componentDetails;
  const renderField = (item) => {
    console.log("Received Item: ",item)
    if (isEditing) {
      if (item.key === 'vendor') {
        return (
          <Select
            fullWidth
            value={vendorValue}
          >
            {vendors.map((vendor) => {
              const vendor_value = `${vendor.vendorID[0]}(${vendor.vendorName})`;
              return (
                <MenuItem 
                  key={vendor._id} 
                  value={vendor_value}
                  onClick={() => handleInputChange(item.key, vendor_value, vendor._id)}
                >
                  {vendor.vendorName}
                </MenuItem>
              );
            })}
          </Select>
        );
      } else if (item.key === 'ram' || item.key === 'hdd') {
        return (
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            type="number"
            value={editedComponent.specifications[item.key]}
            onChange={(e) => handleInputChange(item.key, e.target.value)}
          />
        );
      } else {
        return (
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={editedComponent.specifications[item.key]}
            onChange={(e) => handleInputChange(item.key, e.target.value)}
          />
        );
      }
    } else {
      if (item.key === 'vendor') {
        try {
          return <Typography variant="body2">{`${item.value.vendorName}`}</Typography>;
        } catch (err) {
          console.log(err)
          console.log(item)
        }
      }
      return <Typography variant="body2">{item.value}</Typography>;
    }
  };

  const renderCustomField = (field, index) => {
    if (isEditing) {
      if (field.type === 'string') {
        return (
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={field.value}
            onChange={(e) => handleCustomFieldChange(index, e.target.value)}
          />
        );
      } else if (field.type === 'date') {
        return (
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            type="date"
            value={field.value}
            onChange={(e) => handleCustomFieldChange(index, e.target.value)}
          />
        );
      }
    } else {
      return <Typography variant="body2">{field.value}</Typography>;
    }
  };



  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="specifications-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="specifications-dialog-title" sx={{ bgcolor: color, color: 'white' }}>
        <Typography >{label}</Typography>
      </DialogTitle>
      <DialogContent dividers>
        {showChanges ? (
          <Grid container spacing={3}>
            {[
              { label: "Service Tag / SN", oldValue: componentDetails.specifications.serialNo, newValue: editedComponent.specifications.serialNo, key: "serialNo" },
              { label: "Make / Model", oldValue: componentDetails.specifications.makeModel, newValue: editedComponent.specifications.makeModel, key: "makeModel" },
              ...(componentDetails.type === 1 ? [
                { label: "RAM (GB)", oldValue: componentDetails.specifications.ram, newValue: editedComponent.specifications.ram, key: "ram" },
                { label: "HDD (GB)", oldValue: componentDetails.specifications.hdd, newValue: editedComponent.specifications.hdd, key: "hdd" },
              ] : []),
              ...(component.type === 3 ? [
                { label: "No. of ports", value: component.specifications.ports, key: "ports" },
              ] : []),
              ...(component.type === 4 ? [
                { label: "No. of drives", value: component.specifications.drives, key: "drives" },
                { label: "No. of slots", value: component.specifications.slots, key: "slots" },
              ] : []),
              { label: "Vendor", oldValue: `${componentDetails.specifications.vendorID.vendorID}(${componentDetails.specifications.vendorID.vendorName})`, newValue: `${editedComponent.specifications.vendorID.vendorID}(${editedComponent.specifications.vendorID.vendorName})`, key: "vendor" },
            ].map(item => renderComparisonField(item.label, item.oldValue, item.newValue, item.key))}
            {editedComponent.customFields.map((field, index) => renderComparisonField(field.name, componentDetails.customFields[index].value, field.value, `customField_${index}`))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {[
              { label: "Service Tag / SN", value: component.specifications.serialNo, key: "serialNo" },
              { label: "Make / Model", value: component.specifications.makeModel, key: "makeModel" },
              ...(componentDetails.type === 1 ? [
                { label: "RAM (GB)", value: component.specifications.ram, key: "ram" },
                { label: "HDD (GB)", value: component.specifications.hdd, key: "hdd" },
                ] : []),
                ...(component.type === 3 ? [
                  { label: "No. of ports", value: component.specifications.ports, key: "ports" },
                ] : []),
                ...(component.type === 4 ? [
                  { label: "No. of drives", value: component.specifications.drives, key: "drives" },
                  { label: "No. of slots", value: component.specifications.slots, key: "slots" },
                ] : []),
              { label: "Vendor", value: component.specifications.vendorID, key: "vendor" },
            ].map(item => (
              <React.Fragment key={item.key}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">{item.label}</Typography>
                </Grid>
                <Grid item xs={8}>
                  {renderField(item)}
                </Grid>
              </React.Fragment>
            ))}
            {component.customFields.map((field, index) => (
              <React.Fragment key={`customField_${index}`}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">{field.name}</Typography>
                </Grid>
                <Grid item xs={8}>
                  {renderCustomField(field, index)}
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        {isChanged && !showChanges && (
          <Button onClick={handleSave} color="primary" variant="contained">
            Save Changes
          </Button>
        )}
        {showChanges && (
          <>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmSave} color="primary" variant="contained">
              Confirm Save
            </Button>
          </>
        )}
        {!showChanges && !isEditing && isAdmin && (
          <Button onClick={handleEdit} color="primary" variant="contained">
            Edit
          </Button>
        )}
        {!showChanges && (
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SpecificationsDialog;