import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Modal,
  Form,
  message,
  Spin,
  Tabs,
  Progress,
  Tag,
  Badge,
  Timeline,
  Collapse,
  Rate,
  Space,
} from 'antd';
import {
  DownloadOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  RetweetOutlined,
  TeamOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import './ParentReportCardsPage.css';

const ParentReportCardsPage = () => {
  const { studentId } = useParams();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [acknowledgeForm] = Form.useForm();
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchReports();
    fetchAnalytics();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/parent-reports/my-reports', {
        params: { studentId }
      });
      setReports(response.data.reports);
      if (response.data.reports.length > 0) {
        setSelectedReport(response.data.reports[0]);
      }
    } catch (error) {
      message.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/v1/parent-reports/analytics/summary');
      setAnalyticsData(response.data.analytics);
    } catch (error) {
      console.error('Failed to fetch analytics');
    }
  };

  const handleAcknowledge = async (values) => {
    try {
      setLoading(true);
      await axios.post(`/api/v1/parent-reports/${selectedReport.reportId}/acknowledge`, {
        comments: values.comments,
        sharedWithStudent: values.sharedWithStudent,
        sharedWithTeacher: values.sharedWithTeacher,
      });
      message.success('Report acknowledged successfully');
      setModalVisible(false);
      fetchReports();
    } catch (error) {
      message.error('Failed to acknowledge report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format = 'pdf') => {
    try {
      const response = await axios.get(
        `/api/v1/parent-reports/${selectedReport.reportId}/download-pdf`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `parent-report-${selectedReport.studentId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      message.error('Failed to download report');
    }
  };

  if (loading && !selectedReport) {
    return <div className="parent-report-loading"><Spin size="large" /></div>;
  }

  if (!selectedReport) {
    return (
      <Card>
        <p>No reports available for this student yet.</p>
      </Card>
    );
  }

  const report = selectedReport;
  const habitCategories = ['energy', 'water', 'waste', 'transportation', 'food'];

  const radarData = [
    {
      name: 'Eco-Points',
      value: Math.min((report.gamificationMetrics.totalEcoPoints / 500) * 100, 100),
    },
    {
      name: 'Habits',
      value: report.habitMetrics.habitCompletionRate,
    },
    {
      name: 'Challenges',
      value: report.challengeMetrics.challengeCompletionRate,
    },
    {
      name: 'Activities',
      value: report.activityMetrics.approvalRate,
    },
    {
      name: 'Learning',
      value: report.learningMetrics.assessmentScore,
    },
  ];

  return (
    <div className="parent-report-container">
      {/* Header */}
      <Card className="report-header" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h1>Progress Report Card</h1>
            <p>Comprehensive tracking of {report.studentId.firstName}'s environmental journey</p>
          </Col>
          <Col>
            <Space>
              <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadReport('pdf')}>
                Download PDF
              </Button>
              <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                Print
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Report Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Eco-Points"
              value={report.gamificationMetrics.totalEcoPoints}
              prefix={<ThunderboltOutlined style={{ color: '#FCD34D' }} />}
              valueStyle={{ color: '#FCD34D' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Current Level"
              value={report.gamificationMetrics.currentLevel}
              prefix={<TrophyOutlined style={{ color: '#FF6B6B' }} />}
              valueStyle={{ color: '#FF6B6B' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Current Streak"
              value={report.gamificationMetrics.currentStreak}
              suffix="days"
              prefix={<FireOutlined style={{ color: '#FF8C42' }} />}
              valueStyle={{ color: '#FF8C42' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Overall Performance"
              value={report.parentInsights.overallPerformance}
              valueStyle={{
                color: report.parentInsights.overallPerformance === 'excellent' ? '#52C41A' : '#1890FF',
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Report Tabs */}
      <Tabs style={{ marginBottom: '20px' }} defaultActiveKey="1">
        {/* Activities Summary */}
        <Tabs.TabPane label="🎯 Activities" key="1">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Activity Submission & Approval">
                <Statistic label="Total Submitted" value={report.activityMetrics.totalActivitiesSubmitted} />
                <Statistic label="Approved" value={report.activityMetrics.activitiesApproved} />
                <Progress
                  type="circle"
                  percent={report.activityMetrics.approvalRate}
                  width={100}
                  format={(percent) => `${percent}%`}
                  strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Activity Distribution">
                <p>
                  <CloudOutlined /> Water Saved: {report.activityMetrics.activityDistribution.waterSavedLitres} L
                </p>
                <p>
                  <RetweetOutlined /> Plastic Reduced: {report.activityMetrics.activityDistribution.plasticReducedKg} kg
                </p>
                <p>
                  <ThunderboltOutlined /> Trees Planted: {report.activityMetrics.activityDistribution.treesCounted}
                </p>
                <p>
                  <TeamOutlined /> Community Hours: {report.activityMetrics.activityDistribution.communityServiceHours}
                </p>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        {/* Daily Habits */}
        <Tabs.TabPane label="⭐ Daily Habits" key="2">
          <Card title="Habit Tracking Overview">
            <Statistic label="Active Habits" value={report.habitMetrics.activeHabits} />
            <Progress
              type="circle"
              percent={report.habitMetrics.habitCompletionRate}
              width={100}
              format={(percent) => `${percent}%`}
              strokeColor={{ '0%': '#FF6B6B', '100%': '#52C41A' }}
            />
          </Card>

          <Card title="Habits by Category" style={{ marginTop: '16px' }}>
            <Row gutter={[16, 16]}>
              {habitCategories.map((cat) => (
                <Col xs={24} sm={12} lg={8} key={cat}>
                  <Card type="inner">
                    <h4 style={{ textTransform: 'capitalize' }}>{cat}</h4>
                    <p>Active: {report.habitMetrics.habitsByCategory[cat]?.active || 0}</p>
                    <Progress
                      percent={report.habitMetrics.habitsByCategory[cat]?.completionRate || 0}
                      status={report.habitMetrics.habitsByCategory[cat]?.completionRate >= 70 ? 'success' : 'normal'}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Tabs.TabPane>

        {/* Challenges & Competitions */}
        <Tabs.TabPane label="🏆 Challenges" key="3">
          <Card>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Statistic label="Challenges Participated" value={report.challengeMetrics.challengesParticipated} />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic label="Challenges Completed" value={report.challengeMetrics.challengesCompleted} />
              </Col>
            </Row>
            <Progress
              type="line"
              percent={report.challengeMetrics.challengeCompletionRate}
              format={(percent) => `${percent}% Completion Rate`}
            />
          </Card>
        </Tabs.TabPane>

        {/* Learning & Assessment */}
        <Tabs.TabPane label="📚 Learning" key="4">
          <Card>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <Statistic label="Lessons Completed" value={report.learningMetrics.lessonsCompleted} />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Statistic label="Quizzes Attempted" value={report.learningMetrics.quizzesAttempted} />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Statistic label="Assessment Score" value={report.learningMetrics.assessmentScore} suffix="%" />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Statistic label="Average Score" value={report.learningMetrics.averageScore} suffix="%" />
              </Col>
            </Row>
          </Card>
        </Tabs.TabPane>

        {/* Environmental Impact */}
        <Tabs.TabPane label="🌍 Environmental Impact" key="5">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Impact Metrics">
                <p>
                  <ThunderboltOutlined /> CO₂ Prevented: {report.environmentalImpact.co2PreventedKg} kg
                </p>
                <p>
                  <CloudOutlined /> Water Saved: {report.environmentalImpact.waterSavedLitres} L
                </p>
                <p>
                  <RetweetOutlined /> Plastic Reduced: {report.environmentalImpact.plasticReducedKg} kg
                </p>
                <p>
                  <EnvironmentOutlined /> Trees Planted: {report.environmentalImpact.treesContributed}
                </p>
                <p>Energy Saved: {report.environmentalImpact.energySavedKWh} kWh</p>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Overall Impact Level">
                <Tag
                  color={
                    report.environmentalImpact.impactLevel === 'very_high'
                      ? 'green'
                      : report.environmentalImpact.impactLevel === 'high'
                      ? 'blue'
                      : 'orange'
                  }
                >
                  {report.environmentalImpact.impactLevel.toUpperCase().replace('_', ' ')}
                </Tag>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        {/* Performance Insights */}
        <Tabs.TabPane label="💡 Insights & Recommendations" key="6">
          <Card title="Strengths">
            {report.parentInsights.strengths?.map((strength, idx) => (
              <Tag key={idx} color="green" style={{ marginRight: '8px', marginBottom: '8px' }}>
                ✓ {strength}
              </Tag>
            ))}
          </Card>

          <Card title="Areas for Improvement" style={{ marginTop: '16px' }}>
            {report.parentInsights.areasForImprovement?.map((area, idx) => (
              <Tag key={idx} color="orange" style={{ marginRight: '8px', marginBottom: '8px' }}>
                ⚠ {area}
              </Tag>
            ))}
          </Card>

          <Card title="Recommendations" style={{ marginTop: '16px' }}>
            <Collapse
              items={report.parentInsights.recommendations?.map((rec, idx) => ({
                key: idx,
                label: `${rec.area} - ${rec.priority.toUpperCase()}`,
                extra: <Tag color={rec.priority === 'high' ? 'red' : 'blue'}>{rec.priority}</Tag>,
                children: (
                  <div>
                    <p>{rec.suggestion}</p>
                    <h5>Action Items:</h5>
                    <ul>
                      {rec.actionItems?.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ),
              }))}
            />
          </Card>
        </Tabs.TabPane>

        {/* Analytics Trends */}
        <Tabs.TabPane label="📈 Trends" key="7">
          {analyticsData && (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Performance Trends">
                  <p>Eco-Points Trend: <Tag color={analyticsData.trends?.ecoPointsTrend === 'increasing' ? 'green' : 'orange'}>{analyticsData.trends?.ecoPointsTrend}</Tag></p>
                  <p>Habit Trend: <Tag color={analyticsData.trends?.habitTrend === 'improving' ? 'green' : 'orange'}>{analyticsData.trends?.habitTrend}</Tag></p>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Averages">
                  <Statistic label="Average Eco-Points" value={analyticsData.averageEcoPoints?.toFixed(0)} />
                  <Statistic label="Average Habit Rate" value={analyticsData.averageHabitCompletionRate?.toFixed(1)} suffix="%" />
                </Card>
              </Col>
            </Row>
          )}
        </Tabs.TabPane>
      </Tabs>

      {/* Acknowledgment Section */}
      <Card
        title="Report Acknowledgment"
        extra={
          !report.parentAcknowledgment?.acknowledged && (
            <Button type="primary" onClick={() => setModalVisible(true)}>
              Acknowledge Report
            </Button>
          )
        }
      >
        {report.parentAcknowledgment?.acknowledged ? (
          <div>
            <CheckCircleOutlined style={{ color: '#52C41A', fontSize: '24px' }} />
            <p>
              Acknowledged on {new Date(report.parentAcknowledgment.acknowledgedDate).toLocaleDateString()}
            </p>
            {report.parentAcknowledgment.parentComments && (
              <p>
                <strong>Your Comments:</strong> {report.parentAcknowledgment.parentComments}
              </p>
            )}
          </div>
        ) : (
          <p>
            <ClockCircleOutlined /> Awaiting parent acknowledgment
          </p>
        )}
      </Card>

      {/* Acknowledge Modal */}
      <Modal
        title="Acknowledge Report"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={acknowledgeForm}
          layout="vertical"
          onFinish={handleAcknowledge}
        >
          <Form.Item label="Comments" name="comments">
            <textarea rows={4} placeholder="Any feedback for the teacher..." />
          </Form.Item>

          <Form.Item name="sharedWithStudent" valuePropName="checked" initialValue={false}>
            <Checkbox>Share this report with the student</Checkbox>
          </Form.Item>

          <Form.Item name="sharedWithTeacher" valuePropName="checked" initialValue={false}>
            <Checkbox>Share feedback with the teacher</Checkbox>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Acknowledge & Submit
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default ParentReportCardsPage;
