// src/components/recovery/SupportsEditor.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Flex, Heading, HStack, IconButton, Input, Modal,
  ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
  Table, Tbody, Td, Th, Thead, Tr, Textarea, Select, useDisclosure, useToast
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { listSupports, createSupport, updateSupport, deleteSupport } from '../../services/recoveryStore';

export default function SupportsEditor() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', relation: 'peer', notes: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await listSupports();
      setRows(data);
    } catch {
      toast({ status: 'error', title: 'Failed to load supports' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onAdd = () => { setEdit(null); setForm({ name: '', phone: '', relation: 'peer', notes: '' }); onOpen(); };
  const onEdit = (row) => { setEdit(row); setForm({ name: row.name || '', phone: row.phone || '', relation: row.relation || 'peer', notes: row.notes || '' }); onOpen(); };

  const submit = async () => {
    try {
      if (edit) {
        await updateSupport(edit.id, form);
        toast({ status: 'success', title: 'Updated contact' });
      } else {
        await createSupport(form);
        toast({ status: 'success', title: 'Added contact' });
      }
      onClose(); load();
    } catch {
      toast({ status: 'error', title: 'Save failed' });
    }
  };

  const remove = async (id) => {
    try {
      await deleteSupport(id);
      toast({ status: 'success', title: 'Deleted' });
      load();
    } catch {
      toast({ status: 'error', title: 'Delete failed' });
    }
  };

  const disabled = useMemo(() => !form.name?.trim(), [form]);

  return (
    <Box>
      <Flex align="center" justify="space-between" mb={4}>
        <Heading size="md">Supports</Heading>
        <Button leftIcon={<AddIcon />} onClick={onAdd} colorScheme="teal">Add</Button>
      </Flex>

      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Relation</Th>
            <Th>Phone</Th>
            <Th>Notes</Th>
            <Th isNumeric>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((r) => (
            <Tr key={r.id}>
              <Td>{r.name}</Td>
              <Td>{r.relation}</Td>
              <Td>{r.phone}</Td>
              <Td>{r.notes}</Td>
              <Td isNumeric>
                <HStack justify="flex-end" spacing={1}>
                  <IconButton aria-label="Edit" size="sm" icon={<EditIcon />} onClick={() => onEdit(r)} />
                  <IconButton aria-label="Delete" size="sm" icon={<DeleteIcon />} onClick={() => remove(r.id)} />
                </HStack>
              </Td>
            </Tr>
          ))}
          {!rows.length && !loading && (
            <Tr><Td colSpan={5}>No supports yet.</Td></Tr>
          )}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{edit ? 'Edit Contact' : 'Add Contact'}</ModalHeader>
          <ModalBody>
            <Input
              placeholder="Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              mb={3}
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              mb={3}
            />
            <Select
              value={form.relation}
              onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}
              mb={3}
            >
              <option value="peer">Peer</option>
              <option value="family">Family</option>
              <option value="therapist">Therapist</option>
              <option value="sponsor">Sponsor</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </Select>
            <Textarea
              placeholder="Notes"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose} variant="ghost">Cancel</Button>
            <Button colorScheme="teal" onClick={submit} isDisabled={disabled}>
              {edit ? 'Save' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
