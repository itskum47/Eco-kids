import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Table,
  message,
  Spin,
  Tabs,
  Tag,
  Badge,
  Avatar,
  Timeline,
  Space,
  Progress,
  Empty,
  DatePicker,
  InputNumber,
  Checkbox,
  Upload,
} from 'antd';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';
import UserAddOutlined from '@ant-design/icons/UserAddOutlined';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import ThunderboltOutlined from '@ant-design/icons/ThunderboltOutlined';
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';
import PlayCircleOutlined from '@ant-design/icons/PlayCircleOutlined';
import StockOutlined from '@ant-design/icons/StockOutlined';
import SendOutlined from '@ant-design/icons/SendOutlined';
import dayjs from 'dayjs';
import './EcoClubHubPage.css';

const EcoClubHubPage = () => {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  // Modals
  const [createClubModal, setCreateClubModal] = useState(false);
  const [createActivityModal, setCreateActivityModal] = useState(false);
  const [submissionModal, setSubmissionModal] = useState(false);
  const [announcementModal, setAnnouncementModal] = useState(false);

  // Forms
  const [clubForm] = Form.useForm();
  const [activityForm] = Form.useForm();
  const [submissionForm] = Form.useForm();
  const [announcementForm] = Form.useForm();

  // States
  const [activities, setActivities] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [members, setMembers] = useState([]);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchMyClubs();
  }, []);

  useEffect(() => {
    if (selectedClub) {
      fetchClubDetails();
      fetchActivities();
      fetchSubmissions();
      fetchStatistics();
    }
  }, [selectedClub]);

  const fetchMyClubs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/eco-clubs/my-clubs');
      setClubs([...response.data.coordinatedClubs, ...response.data.memberClubs]);
      if (response.data.coordinatedClubs.length > 0) {
        setSelectedClub(response.data.coordinatedClubs[0]);
      } else if (response.data.memberClubs.length > 0) {
        setSelectedClub(response.data.memberClubs[0]);
      }
    } catch (error) {
      message.error('Failed to fetch eco-clubs');
    } finally {
      setLoading(false);
    }
  };

  const fetchClubDetails = async () => {
    try {
      const response = await axios.get(`/api/v1/eco-clubs/${selectedClub.clubId}`);
      setMembers(response.data.club.membership.members);
    } catch (error) {
      console.error('Failed to fetch club details');
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`/api/v1/eco-clubs/${selectedClub.clubId}/activities`);
      setActivities(response.data.activities);
    } catch (error) {
      console.error('Failed to fetch activities');
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`/api/v1/eco-clubs/${selectedClub.clubId}/submissions`);
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error('Failed to fetch submissions');
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`/api/v1/eco-clubs/${selectedClub.clubId}/statistics`);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Failed to fetch statistics');
    }
  };

  const handleCreateClub = async (values) => {
    try {
      setLoading(true);
      await axios.post('/api/v1/eco-clubs', values);
      message.success('Eco-Club created successfully');
      clubForm.resetFields();
      setCreateClubModal(false);
      fetchMyClubs();
    } catch (error) {
      message.error('Failed to create eco-club');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        plannedDate: values.plannedDate.toISOString(),
      };
      await axios.post(`/api/v1/eco-clubs/${selectedClub.clubId}/activities`, payload);
      message.success('Activity created successfully');
      activityForm.resetFields();
      setCreateActivityModal(false);
      fetchActivities();
    } catch (error) {
      message.error('Failed to create activity');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSubmission = async (submissionId) => {
    try {
      Modal.confirm({
        title: 'Approve Activity',
        content: 'Enter eco-points to award:',
        okText: 'Approve',
        onOk() {
          return new Promise((resolve, reject) => {
            const ecoPoints = prompt('Eco-Points:', '10');
            if (ecoPoints) {
              axios
                .post(
                  `/api/v1/eco-clubs/${selectedClub.clubId}/submissions/${submissionId}/approve`,
                  { ecoPoints: parseInt(ecoPoints) }
                )
                .then(() => {
                  message.success('Activity approved');
                  fetchSubmissions();
                  resolve();
                })
                .catch(() => {
                  message.error('Failed to approve activity');
                  reject();
                });
            }
          });
        },
      });
    } catch (error) {
      console.error('Error approving submission');
    }
  };

  const handleRejectSubmission = async (submissionId) => {
    try {
      const reason = prompt('Rejection reason:');
      if (reason) {
        await axios.post(
          `/api/v1/eco-clubs/${selectedClub.clubId}/submissions/${submissionId}/reject`,
          { rejectionReason: reason }
        );
        message.success('Activity rejected');
        fetchSubmissions();
      }
    } catch (error) {
      message.error('Failed to reject activity');
    }
  };

  const handlePostAnnouncement = async (values) => {
    try {
      setLoading(true);
      await axios.post(`/api/v1/eco-clubs/${selectedClub.clubId}/announcements`, values);
      message.success('Announcement posted');
      announcementForm.resetFields();
      setAnnouncementModal(false);
    } catch (error) {
      message.error('Failed to post announcement');
    } finally {
      setLoading(false);
    }
  };

  if (loading && clubs.length === 0) {
    return <Spin size="large" />;
  }

  if (clubs.length === 0) {
    return (
      <Card>
        <Empty description="No eco-clubs found" />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateClubModal(true)}>
          Create Your First Eco-Club
        </Button>

        <Modal
          title="Create New Eco-Club"
          visible={createClubModal}
          onCancel={() => setCreateClubModal(false)}
          footer={null}
        >
          <Form form={clubForm} layout="vertical" onFinish={handleCreateClub}>
            <Form.Item label="Club Name" name="clubName" rules={[{ required: true }]}>
              <Input placeholder="e.g., Green Warriors Club" />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea rows={4} placeholder="Club description..." />
            </Form.Item>
            <Form.Item label="Focus Area" name="clubFocusArea" initialValue="general">
              <Select
                options={[
                  { label: 'General', value: 'general' },
                  { label: 'Energy Conservation', value: 'energy' },
                  { label: 'Water Management', value: 'water' },
                  { label: 'Waste Reduction', value: 'waste' },
                  { label: 'Biodiversity', value: 'biodiversity' },
                ]}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Create Club
            </Button>
          </Form>
        </Modal>
      </Card>
    );
  }

  const submissionColumns = [
    {
      title: 'Student',
      dataIndex: ['studentId', 'firstName'],
      key: 'student',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          color={
            status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'orange'
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) =>
        record.status === 'pending' ? (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApproveSubmission(record.submissionId)}
            >
              Approve
            </Button>
            <Button
              danger
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleRejectSubmission(record.submissionId)}
            >
              Reject
            </Button>
          </Space>
        ) : null,
    },
  ];

  const activityColumns = [
    {
      title: 'Activity',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Date',
      dataIndex: 'plannedDate',
      key: 'plannedDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={status === 'completed' ? 'green' : 'blue'}>{status}</Tag>,
    },
    {
      title: 'Participants',
      dataIndex: 'actualParticipants',
      key: 'participants',
    },
  ];

  const memberColumns = [
    {
      title: 'Name',
      dataIndex: ['studentId', 'firstName'],
      key: 'name',
      render: (_, record) => {
        const name = `${record.studentId?.firstName} ${record.studentId?.lastName}`;
        return <span>{name}</span>;
      },
    },
    {
      title: 'Joined',
      dataIndex: 'joinedDate',
      key: 'joinedDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Eco-Points',
      dataIndex: 'ecoPointsEarned',
      key: 'ecoPoints',
    },
    {
      title: 'Activities',
      dataIndex: 'activitiesParticipated',
      key: 'activities',
    },
  ];

  return (
    <div className="eco-club-hub-container">
      {/* Header */}
      <Card
        className="club-header"
        style={{
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #00B894 0%, #0BE881 100%)',
          color: 'white',
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <h1>🌱 Eco-Club Hub</h1>
            <p>Manage your environmental club and track member activities</p>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateClubModal(true)}
            >
              Create New Club
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Club Selection */}
      <Card style={{ marginBottom: '20px' }}>
        <h3>Your Eco-Clubs</h3>
        <Row gutter={[16, 16]}>
          {clubs.map((club) => (
            <Col xs={24} sm={12} lg={8} key={club._id}>
              <Card
                hoverable
                onClick={() => setSelectedClub(club)}
                style={{
                  borderColor: selectedClub?._id === club._id ? '#00B894' : undefined,
                  borderWidth: selectedClub?._id === club._id ? 2 : 1,
                }}
              >
                <h4>{club.clubName}</h4>
                <p>{club.description?.substring(0, 60)}...</p>
                <Badge
                  count={club.membership.totalMembers}
                  color="#00B894"
                  overflowCount={999}
                  title="Members"
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {selectedClub && (
        <>
          {/* Club Overview */}
          <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Members"
                  value={selectedClub.membership.totalMembers}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Activities Completed"
                  value={statistics?.totalActivitiesCompleted || 0}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Submissions Approved"
                  value={statistics?.totalSubmissionsApproved || 0}
                  prefix={<ThunderboltOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Eco-Points Awarded"
                  value={statistics?.totalEcoPointsAwarded || 0}
                  precision={0}
                />
              </Card>
            </Col>
          </Row>

          {/* Main Tabs */}
          <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: '20px' }}>
            {/* Activities Tab */}
            <Tabs.TabPane label="📅 Activities" key="1">
              <Card
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateActivityModal(true)}
                  >
                    Plan Activity
                  </Button>
                }
              >
                <Table
                  dataSource={activities}
                  columns={activityColumns}
                  rowKey="_id"
                  pagination={{ pageSize: 10 }}
                  loading={loading}
                />
              </Card>

              <Modal
                title="Plan New Activity"
                visible={createActivityModal}
                onCancel={() => setCreateActivityModal(false)}
                footer={null}
              >
                <Form form={activityForm} layout="vertical" onFinish={handleCreateActivity}>
                  <Form.Item label="Activity Title" name="title" rules={[{ required: true }]}>
                    <Input placeholder="e.g., Tree Planting Day" />
                  </Form.Item>
                  <Form.Item label="Description" name="description">
                    <Input.TextArea rows={4} placeholder="Activity details..." />
                  </Form.Item>
                  <Form.Item label="Category" name="category" initialValue="cleanup">
                    <Select
                      options={[
                        { label: 'Cleanup', value: 'cleanup' },
                        { label: 'Plantation', value: 'plantation' },
                        { label: 'Awareness', value: 'awareness' },
                        { label: 'Meeting', value: 'meeting' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label="Planned Date" name="plannedDate" rules={[{ required: true }]}>
                    <DatePicker />
                  </Form.Item>
                  <Form.Item label="Location" name="location">
                    <Input placeholder="Activity location..." />
                  </Form.Item>
                  <Form.Item label="Expected Participants" name="estimatedParticipants">
                    <InputNumber min={1} />
                  </Form.Item>
                  <Form.Item label="Eco-Points" name="expectedEcoPoints" initialValue={10}>
                    <InputNumber min={1} />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    Create Activity
                  </Button>
                </Form>
              </Modal>
            </Tabs.TabPane>

            {/* Submissions Tab */}
            <Tabs.TabPane label="✅ Activity Submissions" key="2">
              <Card>
                <Table
                  dataSource={submissions}
                  columns={submissionColumns}
                  rowKey="submissionId"
                  pagination={{ pageSize: 10 }}
                  loading={loading}
                />
              </Card>
            </Tabs.TabPane>

            {/* Members Tab */}
            <Tabs.TabPane label="👥 Members" key="3">
              <Card extra={
                <Button icon={<UserAddOutlined />} onClick={() => {
                  // Open member management modal
                }}>
                  Manage Members
                </Button>
              }>
                <Table
                  dataSource={members}
                  columns={memberColumns}
                  rowKey="studentId"
                  pagination={{ pageSize: 10 }}
                  loading={loading}
                />
              </Card>
            </Tabs.TabPane>

            {/* Statistics Tab */}
            <Tabs.TabPane label="📊 Statistics" key="4">
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="Team Performance">
                    {statistics && (
                      <>
                        <p>
                          <strong>Participation Rate:</strong>{' '}
                          <Progress percent={statistics.averageParticipationRate} />
                        </p>
                        <p>
                          <strong>Member Retention:</strong>{' '}
                          <Progress percent={statistics.memberRetentionRate} />
                        </p>
                      </>
                    )}
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="Environmental Impact">
                    {statistics && (
                      <>
                        <p>Trees Planted: {statistics.environmentalImpactToDate.treesCumulative}</p>
                        <p>Plastic Reduced: {statistics.environmentalImpactToDate.plasticCumulativeKg} kg</p>
                        <p>Water Saved: {statistics.environmentalImpactToDate.waterCumulativeLitres} L</p>
                        <p>CO₂ Prevented: {statistics.environmentalImpactToDate.co2CumulativeKg} kg</p>
                      </>
                    )}
                  </Card>
                </Col>
              </Row>
            </Tabs.TabPane>

            {/* Announcements Tab */}
            <Tabs.TabPane label="📢 Announcements" key="5">
              <Card
                extra={
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => setAnnouncementModal(true)}
                  >
                    Post Announcement
                  </Button>
                }
              >
                <Empty description="No announcements yet" />
              </Card>

              <Modal
                title="Post Announcement"
                visible={announcementModal}
                onCancel={() => setAnnouncementModal(false)}
                footer={null}
              >
                <Form form={announcementForm} layout="vertical" onFinish={handlePostAnnouncement}>
                  <Form.Item label="Title" name="title" rules={[{ required: true }]}>
                    <Input placeholder="Announcement title..." />
                  </Form.Item>
                  <Form.Item label="Content" name="content" rules={[{ required: true }]}>
                    <Input.TextArea rows={6} placeholder="Your announcement..." />
                  </Form.Item>
                  <Form.Item label="Priority" name="priority" initialValue="medium">
                    <Select
                      options={[
                        { label: 'Low', value: 'low' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'High', value: 'high' },
                      ]}
                    />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    Post Announcement
                  </Button>
                </Form>
              </Modal>
            </Tabs.TabPane>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default EcoClubHubPage;
