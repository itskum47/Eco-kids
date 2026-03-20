import { client, account } from './appwrite';
import { Query } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'ecokids_main';

const databases = {
  async getDocument(collectionId, docId) {
    const response = await client.request(`/databases/${DATABASE_ID}/collections/${collectionId}/documents/${docId}`, {
      method: 'GET'
    });
    return response;
  },

  async listDocuments(collectionId, queries = []) {
    const queryString = queries.length
      ? `?${queries.map(q => `queries[]=${encodeURIComponent(q)}`).join('&')}`
      : '';

    const response = await client.request(`/databases/${DATABASE_ID}/collections/${collectionId}/documents${queryString}`, {
      method: 'GET'
    });
    return response;
  },

  async createDocument(collectionId, data) {
    const response = await client.request(`/databases/${DATABASE_ID}/collections/${collectionId}/documents`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response;
  },

  async updateDocument(collectionId, docId, data) {
    const response = await client.request(`/databases/${DATABASE_ID}/collections/${collectionId}/documents/${docId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return response;
  },

  async deleteDocument(collectionId, docId) {
    await client.request(`/databases/${DATABASE_ID}/collections/${collectionId}/documents/${docId}`, {
      method: 'DELETE'
    });
  }
};

const storage = {
  async getFile(bucketId, fileId) {
    return `${client.endpoint}/storage/buckets/${bucketId}/files/${fileId}/preview/?project=${client.projectId}`;
  },

  async uploadFile(bucketId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${client.endpoint}/storage/buckets/${bucketId}/files`, {
      method: 'POST',
      headers: {
        'X-Appwrite-Project': client.projectId
      },
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  },

  async deleteFile(bucketId, fileId) {
    await fetch(`${client.endpoint}/storage/buckets/${bucketId}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'X-Appwrite-Project': client.projectId
      },
      credentials: 'include'
    });
  }
};

export { databases, storage, account };
