import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUser, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaUserCog,
  FaSearch,
  FaFilter,
  FaDownload,
  FaUserPlus,
  FaEdit,
  FaBan,
  FaCheck,
  FaEye,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaSchool,
  FaMapMarkerAlt,
  FaTrophy,
  FaStar
} from 'react-icons/fa';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const tabs = [
    { id: 'students', label: 'Students', icon: FaUserGraduate, count: 2847 },
    { id: 'teachers', label: 'Teachers', icon: FaChalkboardTeacher, count: 156 },
    { id: 'parents', label: 'Parents', icon: FaUser, count: 1923 },
    { id: 'admins', label: 'Admins', icon: FaUserCog, count: 12 }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'pending', label: 'Pending Verification' }
  ];

  const sampleUsers = {
    students: [
      {
        id: 1,
        name: 'Arjun Sharma',
        email: 'arjun.sharma@email.com',
        grade: '8th Grade',
        school: 'Delhi Public School, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        status: 'active',
        joinDate: '2024-01-15',
        lastActive: '2 hours ago',
        points: 1250,
        level: 5,
        badges: 12,
        avatar: null
      },
      {
        id: 2,
        name: 'Priya Patel',
        email: 'priya.patel@email.com',
        grade: '6th Grade',
        school: 'Kendriya Vidyalaya, Ahmedabad',
        city: 'Ahmedabad',
        state: 'Gujarat',
        status: 'active',
        joinDate: '2024-01-10',
        lastActive: '5 hours ago',
        points: 890,
        level: 3,
        badges: 8,
        avatar: null
      },
      {
        id: 3,
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        grade: '10th Grade',
        school: 'Modern School, Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        status: 'inactive',
        joinDate: '2023-12-20',
        lastActive: '3 days ago',
        points: 2100,
        level: 7,
        badges: 18,
        avatar: null
      }
    ],
    teachers: [
      {
        id: 1,
        name: 'Dr. Meera Singh',
        email: 'meera.singh@school.edu',
        subject: 'Environmental Science',
        school: 'Delhi Public School, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        status: 'active',
        joinDate: '2023-08-15',
        lastActive: '1 hour ago',
        studentsManaged: 45,
        experience: '12 years'
      },
      {
        id: 2,
        name: 'Prof. Amit Gupta',
        email: 'amit.gupta@school.edu',
        subject: 'Biology',
        school: 'Kendriya Vidyalaya, Chennai',
        city: 'Chennai',
        state: 'Tamil Nadu',
        status: 'active',
        joinDate: '2023-09-01',
        lastActive: '30 minutes ago',
        studentsManaged: 67,
        experience: '8 years'
      }
    ],
    parents: [
      {
        id: 1,
        name: 'Mrs. Sunita Sharma',
        email: 'sunita.sharma@email.com',
        children: ['Arjun Sharma', 'Kavya Sharma'],
        city: 'Mumbai',
        state: 'Maharashtra',
        status: 'active',
        joinDate: '2024-01-15',
        lastActive: '4 hours ago'
      }
    ],
    admins: [
      {
        id: 1,
        name: 'System Administrator',
        email: 'admin@ecokids.com',
        role: 'Super Admin',
        permissions: 'All',
        status: 'active',
        joinDate: '2023-01-01',
        lastActive: 'Just now'
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const UserTable = ({ users, type }) => (
    <div className="bg-[var(--s1)] rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedUsers(users.map(u => u.id));
                  } else {
                    setSelectedUsers([]);
                  }
                }}
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            {type === 'students' && (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade & School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
              </>
            )}
            {type === 'teachers' && (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject & School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
              </>
            )}
            {type === 'parents' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Children
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Active
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--s1)] divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers([...selectedUsers, user.id]);
                    } else {
                      setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                    }
                  }}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              
              {type === 'students' && (
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.grade}</div>
                    <div className="text-sm text-gray-500">{user.school}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <FaTrophy className="text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-900">{user.points}</span>
                      </div>
                      <div className="flex items-center">
                        <FaStar className="text-blue-500 mr-1" />
                        <span className="text-sm text-gray-900">L{user.level}</span>
                      </div>
                    </div>
                  </td>
                </>
              )}
              
              {type === 'teachers' && (
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.subject}</div>
                    <div className="text-sm text-gray-500">{user.school}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.studentsManaged} students</div>
                    <div className="text-sm text-gray-500">{user.experience} experience</div>
                  </td>
                </>
              )}
              
              {type === 'parents' && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.children ? user.children.join(', ') : 'No children linked'}
                  </div>
                </td>
              )}
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.city}</div>
                <div className="text-sm text-gray-500">{user.state}</div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.lastActive}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <FaEye />
                  </button>
                  <button className="text-green-600 hover:text-green-900">
                    <FaEdit />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    <FaEnvelope />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <FaBan />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage students, teachers, parents, and administrators</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <FaDownload className="mr-2" />
            Export
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <FaUserPlus className="mr-2" />
            Add User
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <div key={tab.id} className="bg-[var(--s1)] rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <IconComponent className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{tab.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{tab.count.toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-[var(--s1)] rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="mr-2" />
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center space-x-2">
                <button className="flex items-center px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                  <FaCheck className="mr-1" />
                  Activate
                </button>
                <button className="flex items-center px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">
                  <FaBan className="mr-1" />
                  Suspend
                </button>
                <button className="flex items-center px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                  <FaEnvelope className="mr-1" />
                  Email
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Table */}
        <div className="p-6">
          <UserTable users={sampleUsers[activeTab] || []} type={activeTab} />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;