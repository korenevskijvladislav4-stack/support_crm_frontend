// components/QualityCallsTableView.tsx
import React, { useMemo } from 'react';
import { 
  Table, 
  Card, 
  Tooltip, 
  Popover,
  Space,
  Typography,
  Tag,
  theme
} from 'antd';
import { 
  PhoneOutlined,
  TrophyOutlined,
  FolderOutlined
} from '@ant-design/icons';
import type { IQualityMap, IQualityCallDeduction, IQualityMapCriterion } from '../types/quality.types';

const { Text } = Typography;

interface QualityCallsTableViewProps {
  qualityMap: IQualityMap;
}

interface QualityCallsTableRow {
  key: string;
  id?: number;
  name: string;
  description?: string;
  isTotal?: boolean;
  categoryName?: string;
  isFirstInCategory?: boolean;
  [key: string]: unknown;
}

// Фиксированные размеры колонок
const CRITERIA_COLUMN_WIDTH = 220;
const CALL_COLUMN_WIDTH = 150;

const QualityCallsTableView: React.FC<QualityCallsTableViewProps> = ({ qualityMap }) => {
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#0d1117';
  
  const allCriteria = useMemo<IQualityMapCriterion[]>(() => qualityMap.criteria || [], [qualityMap.criteria]);

  const callsTotal = qualityMap?.progress?.calls.total || (qualityMap?.call_ids?.length ?? 0);
  const callIds = useMemo(() => 
    qualityMap?.call_ids || Array(callsTotal).fill(''), 
    [qualityMap?.call_ids, callsTotal]
  );

  const callDeductionsMap = useMemo(() => {
    const map = new Map<string, IQualityCallDeduction>();
    qualityMap?.call_deductions?.forEach(deduction => {
      if (deduction?.criteria_id && deduction?.call_id) {
        const key = `${deduction.criteria_id}_${deduction.call_id}`;
        map.set(key, deduction);
      }
    });
    return map;
  }, [qualityMap?.call_deductions]);

  const groupedCriteria = useMemo(() => {
    const groups = new Map<string, IQualityMapCriterion[]>();
    allCriteria.forEach((criterion: IQualityMapCriterion) => {
      const categoryKey = criterion.category?.id?.toString() || 'no_category';
      if (!groups.has(categoryKey)) {
        groups.set(categoryKey, []);
      }
      groups.get(categoryKey)!.push(criterion);
    });
    return groups;
  }, [allCriteria]);

  const getScoreColor = React.useCallback((score: number | undefined) => {
    if (score === undefined) return token.colorTextTertiary;
    if (score >= 90) return '#52c41a';
    if (score >= 70) return '#faad14';
    return '#ff4d4f';
  }, [token.colorTextTertiary]);

  const callTotals = useMemo(() => {
    const totals: { [key: number]: { score: number; deduction: number } } = {};
    callIds.forEach((callId, callIndex) => {
      if (!callId) {
        totals[callIndex] = { score: 0, deduction: 0 };
        return;
      }
      let totalDeduction = 0;
      allCriteria.forEach(criterion => {
        const criterionKey = criterion.criteria_id ?? criterion.id;
        const deductionKey = `${criterionKey}_${callId}`;
        const deduction = callDeductionsMap.get(deductionKey);
        if (deduction && typeof deduction.deduction === 'number') {
          totalDeduction += deduction.deduction;
        }
      });
      totals[callIndex] = {
        score: Math.max(0, 100 - totalDeduction),
        deduction: totalDeduction
      };
    });
    return totals;
  }, [callDeductionsMap, allCriteria, callIds]);

  const columns = useMemo(() => [
    {
      title: (
        <div style={{ 
          fontSize: 12, 
          fontWeight: 600, 
          color: token.colorText,
          padding: '4px 0'
        }}>
          Критерий
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left' as const,
      width: CRITERIA_COLUMN_WIDTH,
      render: (name: string, record: QualityCallsTableRow) => {
        if (record.isTotal) {
          return (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6,
              fontWeight: 600,
              fontSize: 12,
              color: token.colorWarning,
              padding: '4px 8px',
              background: isDark ? 'rgba(250, 173, 20, 0.1)' : 'rgba(250, 173, 20, 0.08)',
              borderRadius: 4,
            }}>
              <TrophyOutlined />
              <span>ИТОГ</span>
            </div>
          );
        }

        return (
          <Tooltip 
            title={record.description}
            placement="right"
            overlayStyle={{ maxWidth: 300 }}
          >
            <div style={{ 
              padding: '4px 0',
              cursor: record.description ? 'help' : 'default',
            }}>
              {record.isFirstInCategory && record.categoryName && (
                <div style={{ 
                  fontSize: 10,
                  color: token.colorTextTertiary,
                  marginBottom: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <FolderOutlined style={{ fontSize: 9 }} />
                  {record.categoryName}
                </div>
              )}
              <Text 
                ellipsis 
                style={{ 
                  fontSize: 12, 
                  fontWeight: 500,
                  color: token.colorText,
                  display: 'block'
                }}
              >
                {name}
              </Text>
            </div>
          </Tooltip>
        );
      },
    },
    ...callIds.map((callId, callIndex) => ({
      title: (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column' as const,
          alignItems: 'center',
          gap: 2,
          padding: '2px 0',
        }}>
          <PhoneOutlined style={{ 
            fontSize: 10, 
            color: callId ? token.colorWarning : token.colorTextTertiary
          }} />
          <Text 
            ellipsis 
            style={{ 
              fontSize: 9,
              color: callId ? token.colorText : token.colorTextTertiary,
              maxWidth: CALL_COLUMN_WIDTH - 8,
              textAlign: 'center' as const,
            }}
          >
            {callId || `Звонок ${callIndex + 1}`}
          </Text>
        </div>
      ),
      dataIndex: `call_${callIndex}`,
      key: `call_${callIndex}`,
      width: CALL_COLUMN_WIDTH,
      align: 'center' as const,
      render: (_: unknown, record: QualityCallsTableRow) => {
        const currentCallId = callIds[callIndex];
        
        // Итоговая строка
        if (record.isTotal) {
          if (!currentCallId) {
            return <Text type="secondary" style={{ fontSize: 11 }}>—</Text>;
          }
          const totalScore = callTotals[callIndex]?.score;
          return (
            <Tag 
              color={getScoreColor(totalScore)}
              style={{ 
                margin: 0, 
                fontSize: 11, 
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              {totalScore}%
            </Tag>
          );
        }

        if (!currentCallId || !record.id) {
          return <Text type="secondary" style={{ fontSize: 10 }}>—</Text>;
        }

        const deduction = qualityMap.call_deductions?.find(d => 
          d.criteria_id === record.id && d.call_id === currentCallId
        );
        
        const hasDeduction = deduction && typeof deduction.deduction === 'number' && deduction.deduction > 0;
        const deductionValue = hasDeduction ? deduction!.deduction : 0;
        const comment = deduction?.comment;
        
        const cellContent = (
          <div style={{ 
            fontSize: 11, 
            fontWeight: hasDeduction ? 600 : 400,
            color: hasDeduction ? token.colorError : token.colorTextTertiary,
            padding: '4px 6px',
            borderRadius: 4,
            background: hasDeduction 
              ? (isDark ? 'rgba(255, 77, 79, 0.15)' : 'rgba(255, 77, 79, 0.08)')
              : 'transparent',
            position: 'relative' as const,
          }}>
            {hasDeduction ? `-${deductionValue}` : '0'}
            {comment && (
              <div style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: token.colorPrimary,
              }} />
            )}
          </div>
        );

        if (comment) {
          return (
            <Popover
              content={<div style={{ maxWidth: 250, fontSize: 12 }}>{comment}</div>}
              title="Комментарий"
              trigger="hover"
              placement="top"
            >
              {cellContent}
            </Popover>
          );
        }

        return cellContent;
      },
    })),
  ], [callIds, callTotals, qualityMap.call_deductions, token, isDark, getScoreColor]);

  const dataSource = useMemo(() => {
    const rows: QualityCallsTableRow[] = [];

    const sortedCategories = Array.from(groupedCriteria.entries()).sort((a, b) => {
      if (a[0] === 'no_category') return 1;
      if (b[0] === 'no_category') return -1;
      const categoryA = allCriteria.find(c => c.category?.id?.toString() === a[0])?.category;
      const categoryB = allCriteria.find(c => c.category?.id?.toString() === b[0])?.category;
      return (categoryA?.name || '').localeCompare(categoryB?.name || '');
    });

    sortedCategories.forEach(([, criteria]) => {
      const firstCriterion = criteria[0];
      const categoryName = firstCriterion.category?.name || 'Без категории';

      criteria.forEach((criterion: IQualityMapCriterion, index) => {
        rows.push({
          key: `criteria_${criterion.id}`,
          id: criterion.criteria_id ?? criterion.id,
          name: criterion.name || 'Неизвестный критерий',
          description: criterion.description ?? undefined,
          categoryName,
          isFirstInCategory: index === 0,
        });
      });
    });

    // Итоговая строка
    rows.push({
      key: 'total_row',
      name: 'ИТОГ',
      isTotal: true,
    });

    return rows;
  }, [groupedCriteria, allCriteria]);

  if (!qualityMap || callIds.length === 0) {
    return null;
  }

  // Расчёт ширины таблицы
  const tableWidth = CRITERIA_COLUMN_WIDTH + (callIds.length * CALL_COLUMN_WIDTH);

  return (
    <Card
      size="small"
      title={
        <Space>
          <PhoneOutlined style={{ color: token.colorWarning }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Оценка звонков</span>
          <Tag color="orange" style={{ margin: 0 }}>
            {callIds.filter(id => id).length} / {callIds.length}
          </Tag>
        </Space>
      }
      style={{ 
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ 
        width: '100%', 
        overflowX: 'auto',
        overflowY: 'hidden',
      }}>
        <Table
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: tableWidth, y: 450 }}
          pagination={false}
          size="small"
          bordered
          sticky
          style={{ 
            minWidth: tableWidth,
          }}
          rowClassName={(record) => record.isTotal ? 'quality-total-row' : ''}
        />
      </div>
    </Card>
  );
};

export default QualityCallsTableView;
