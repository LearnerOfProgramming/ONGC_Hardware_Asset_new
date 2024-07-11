import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';

const VendorComponent = () => {
  const [vendors, setVendors] = useState([]);
  const [open, setOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({ vendorName: '', vendorID: [] });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/general/vendors');
      setVendors(response.data);
      console.log(vendors)
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewVendor({ vendorName: '', vendorID: [] });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewVendor({ ...newVendor, [name]: value });
  };

  const handleSave = async () => {
    try {
      // console.log("New Vendor:",newVendor)
      const res = await axios.post('/general/vendors', newVendor);
      alert(res.data)
      handleClose();
      fetchVendors();
    } catch (error) {
      console.error('Error saving vendor:', error);
    }
  };

  return (
    <Container maxWidth="lg" className="mt-8 p-8">
      <h2 className="mb-4 text-5xl ">Vendors</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vendor Name</TableCell>
              <TableCell>Contract No.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor._id}>
                <TableCell>{vendor.vendorName}</TableCell>
                <TableCell>
                  <span>{vendor.vendorID[0]}</span>
                  {vendor.vendorID.slice(1).map((id) => (
                    <span key={id}>{",\t"}{id}</span>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className='py-5'>
        <Button variant='contained' onClick={handleOpen}>Add Vendor</Button>
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Vendor</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="vendorName"
            label="Vendor Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newVendor.vendorName}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="vendorID"
            label="Contract No."
            type="text"
            fullWidth
            variant="outlined"
            value={newVendor.vendorID}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VendorComponent;