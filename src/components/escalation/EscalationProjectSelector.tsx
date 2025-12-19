import React, { useEffect, useState } from 'react';
import { EscalationProject } from '../../types/escalation';
import { getEscalationProjects, createEscalationProject, updateEscalationProject, deleteEscalationProject } from '../../services/escalationService';
import { Card, Button, Modal, Input, Tooltip, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

interface Props {
  onSelect: (project: EscalationProject) => void;
  selectedProjectId?: string;
}

const EscalationProjectSelector: React.FC<Props> = ({ onSelect, selectedProjectId }) => {
  const [projects, setProjects] = useState<EscalationProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editProject, setEditProject] = useState<EscalationProject | null>(null);
  const [projectName, setProjectName] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    const data = await getEscalationProjects();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    if (!projectName.trim()) return message.error('Project name required');
    await createEscalationProject({ name: projectName });
    setModalVisible(false);
    setProjectName('');
    fetchProjects();
  };

  const handleEdit = async () => {
    if (!editProject || !projectName.trim()) return;
    await updateEscalationProject(editProject.id, { name: projectName });
    setEditProject(null);
    setModalVisible(false);
    setProjectName('');
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    await deleteEscalationProject(id);
    fetchProjects();
  };

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditProject(null); setProjectName(''); setModalVisible(true); }}>
        Create New Project
      </Button>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 24 }}>
        {projects.map(project => (
          <Card
            key={project.id}
            title={project.name}
            style={{ width: 300, margin: 12, border: selectedProjectId === project.id ? '2px solid #1890ff' : undefined }}
            actions={[
              <Tooltip title="View/Open" key="view"><EyeOutlined onClick={() => onSelect(project)} /></Tooltip>,
              <Tooltip title="Edit" key="edit"><EditOutlined onClick={() => { setEditProject(project); setProjectName(project.name); setModalVisible(true); }} /></Tooltip>,
              <Tooltip title="Delete" key="delete">
                <Popconfirm title="Delete this project?" onConfirm={() => handleDelete(project.id)} okText="Yes" cancelText="No">
                  <DeleteOutlined />
                </Popconfirm>
              </Tooltip>
            ]}
          >
            <div>Created: {project.createdAt && new Date(project.createdAt).toLocaleDateString()}</div>
          </Card>
        ))}
      </div>
      <Modal
        title={editProject ? 'Edit Project' : 'Create New Project'}
        open={modalVisible}
        onOk={editProject ? handleEdit : handleCreate}
        onCancel={() => { setModalVisible(false); setEditProject(null); setProjectName(''); }}
        okText={editProject ? 'Save' : 'Create'}
      >
        <Input
          placeholder="Name of Project"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          maxLength={100}
        />
      </Modal>
    </div>
  );
};

export default EscalationProjectSelector;
