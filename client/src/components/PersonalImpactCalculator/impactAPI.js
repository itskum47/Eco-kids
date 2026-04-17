import { impactCalculatorAPI } from '../../utils/api';

export const fetchImpactMetrics = async (period = 'month') => {
  const { data } = await impactCalculatorAPI.getMetrics(period);
  return data?.data || {};
};

export const fetchImpactBaseline = async () => {
  const { data } = await impactCalculatorAPI.getBaseline();
  return data?.data || null;
};

export const saveImpactBaseline = async (payload) => {
  const { data } = await impactCalculatorAPI.setBaseline(payload);
  return data?.data;
};

export const submitDailyAction = async (payload) => {
  const { data } = await impactCalculatorAPI.logDailyAction(payload);
  return data?.data;
};

export const fetchImpactComparison = async (period = 'month') => {
  const { data } = await impactCalculatorAPI.getComparison(period);
  return data?.data || {};
};

export const fetchImpactTrend = async (months = 6) => {
  const { data } = await impactCalculatorAPI.getTrend(months);
  return data?.data || [];
};
