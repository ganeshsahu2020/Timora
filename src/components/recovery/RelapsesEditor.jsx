// src/components/recovery/RelapsesEditor.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Flex, Heading, HStack, IconButton, Input, NumberInput, NumberInputField,
  Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
  Table, Tbody, Td, Th, Thead, Tr, Textarea, useDisclosure, useToast
} from '@chakra-ui/react';
  import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { listRelapses, createRelapse, updateRelapse, deleteRelapse } from '../../services/recoveryStore';

export default function RelapsesEditor() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ date: '', trigger: '', intensity: 5, notes: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await listRelapses();
      setRows(data);
    } catch {
      toast({ status: 'error', title: 'Failed to load relapses' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onAdd = () => { setEdit(null); setForm({ date: new Date().toISOString().slice(0, 10), trigger: '', intensity: 5, notes: '' }); onOpen(); };
  const onEdit = (row) => {
    const d = row.date?.slice?.(0,10) || new Date().toISOString().slice(0,10);
    setEdit(row); setForm({ date: d, trigger: row.trigger || '', intensity: row.intensity ?? 5, notes: row.notes || '' });
    onOpen();
  };

  const submit = async () => {
    try {
      if (edit) {
        await updateRelapse(edit.id, form);
        toast({ status: 'success', title: 'Updated relapse note' });
      } else {
        await createRelapse(form);
        toast({ status: 'success', title: 'Logged relapse note' });
      }
      onClose(); load();
    } catch {
      toast({ status: 'error', title: 'Save failed' });
    }
  };

  const remove = async (id) => {
    try {
      await deleteRelapse(id);
      toast({ status: 'success', title: 'Deleted' });
      load();
    } catch {
      toast({ status: 'error', title: 'Delete failed' });
    }
  };

  const disabled = useMemo(() => !form.date || !form.trigger?.trim(), [form]);

  return (
    <Box>
      <Flex align="center" justify="space-between" mb={4}>
        <Heading size="md">Relapse Notes</Heading>
        <Button leftIcon={<AddIcon />} onClick={onAdd} colorScheme="teal">Add</Button>
      </Flex>

      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Trigger</Th>
            <Th>Intensity</Th>
            <Th>Notes</Th>
            <Th isNumeric>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((r) => (
            <Tr key={r.id}>
              <Td>{(r.date || '').slice(0,10)}</Td>
              <Td>{r.trigger}</Td>
              <Td>{r.intensity}</Td>
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
            <Tr><Td colSpan={5}>No relapse notes yet.</Td></Tr>
          )}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{edit ? 'Edit Note' : 'Add Note'}</ModalHeader>
          <ModalBody>
            <Input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              mb={3}
            />
            <Input
              placeholder="Trigger (e.g., social pressure)"
              value={form.trigger}
              onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}
              mb={3}
            />
            <NumberInput value={form.intensity} min={0} max={10} onChange={(_, n) => setForm(f => ({ ...f, intensity: n }))} mb={3}>
              <NumberInputField placeholder="Intensity (0-10)" />
            </NumberInput>
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
