// src/components/recovery/TriggersEditor.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Flex, Heading, HStack, IconButton, Input, Modal,
  ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
  Table, Tbody, Td, Th, Thead, Tr, Textarea, useDisclosure, useToast
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { listTriggers, createTrigger, updateTrigger, deleteTrigger } from '../../services/recoveryStore';

export default function TriggersEditor() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [edit, setEdit] = useState(null); // row or null
  const [form, setForm] = useState({ label: '', notes: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await listTriggers();
      setRows(data);
    } catch (e) {
      toast({ status: 'error', title: 'Failed to load triggers' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onAdd = () => { setEdit(null); setForm({ label: '', notes: '' }); onOpen(); };
  const onEdit = (row) => { setEdit(row); setForm({ label: row.label || '', notes: row.notes || '' }); onOpen(); };

  const submit = async () => {
    try {
      if (edit) {
        await updateTrigger(edit.id, form);
        toast({ status: 'success', title: 'Updated trigger' });
      } else {
        await createTrigger(form);
        toast({ status: 'success', title: 'Added trigger' });
      }
      onClose(); load();
    } catch {
      toast({ status: 'error', title: 'Save failed' });
    }
  };

  const remove = async (id) => {
    try {
      await deleteTrigger(id);
      toast({ status: 'success', title: 'Deleted' });
      load();
    } catch {
      toast({ status: 'error', title: 'Delete failed' });
    }
  };

  const disabled = useMemo(() => !form.label?.trim(), [form]);

  return (
    <Box>
      <Flex align="center" justify="space-between" mb={4}>
        <Heading size="md">Triggers</Heading>
        <Button leftIcon={<AddIcon />} onClick={onAdd} colorScheme="teal">Add</Button>
      </Flex>

      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th>Label</Th>
            <Th>Notes</Th>
            <Th isNumeric>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((r) => (
            <Tr key={r.id}>
              <Td>{r.label}</Td>
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
            <Tr><Td colSpan={3}>No triggers yet.</Td></Tr>
          )}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{edit ? 'Edit Trigger' : 'Add Trigger'}</ModalHeader>
          <ModalBody>
            <Input
              placeholder="Trigger label (e.g., Evenings alone)"
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              mb={3}
            />
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
