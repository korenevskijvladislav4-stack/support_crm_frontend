// components/QualityTableView.tsx
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
  MessageOutlined,
  TrophyOutlined,
  FolderOutlined
} from '@ant-design/icons';
import type { IQualityMap, IQualityDeduction, IQualityMapCriterion } from '../types/quality.types';

const { Text } = Typography;

interface QualityTableViewProps {
  qualityMap: IQualityMap;
}

interface QualityTableRow {
  key: string;
  id?: number;
  name: string;
  description?: string;
  isTotal?: boolean;
  isCategory?: boolean;
  categoryId?: number | null;
  categoryName?: string;
  isFirstInCategory?: boolean;
  [key: string]: unknown;
}

// Фиксированные размеры колонок
const CRITERIA_COLUMN_WIDTH = 220;
const CHAT_COLUMN_WIDTH = 150;

const QualityTableView: React.FC<QualityTableViewProps> = ({ qualityMap }) => {
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#0d1117';
  
  const allCriteria = useMemo<IQualityMapCriterion[]>(() => qualityMap.criteria || [], [qualityMap.criteria]);

  const chatIds = useMemo(() => qualityMap?.chat_ids || Array(15).fill(''), [qualityMap?.chat_ids]);

  const deductionsMap = useMemo(() => {
    const map = new Map<string, IQualityDeduction>();
    qualityMap?.deductions?.forEach(deduction => {
      if (deduction?.criteria_id && deduction?.chat_id) {
        const key = `${deduction.criteria_id}_${deduction.chat_id}`;
        map.set(key, deduction);
      }
    });
    return map;
  }, [qualityMap?.deductions]);

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

  const chatTotals = useMemo(() => {
    const totals: { [key: number]: { score: number; deduction: number } } = {};
    chatIds.forEach((chatId, chatIndex) => {
      if (!chatId) {
        totals[chatIndex] = { score: 0, deduction: 0 };
        return;
      }
      let totalDeduction = 0;
      allCriteria.forEach(criterion => {
        const criterionKey = criterion.criteria_id ?? criterion.id;
        const deductionKey = `${criterionKey}_${chatId}`;
        const deduction = deductionsMap.get(deductionKey);
        if (deduction && typeof deduction.deduction === 'number') {
          totalDeduction += deduction.deduction;
        }
      });
      totals[chatIndex] = {
        score: Math.max(0, 100 - totalDeduction),
        deduction: totalDeduction
      };
    });
    return totals;
  }, [deductionsMap, allCriteria, chatIds]);

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
      render: (name: string, record: QualityTableRow) => {
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
    ...chatIds.map((chatId, chatIndex) => ({
      title: (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column' as const,
          alignItems: 'center',
          gap: 2,
          padding: '2px 0',
        }}>
          <MessageOutlined style={{ 
            fontSize: 10, 
            color: chatId ? token.colorSuccess : token.colorTextTertiary
          }} />
          <Text 
            ellipsis 
            style={{ 
              fontSize: 9,
              color: chatId ? token.colorText : token.colorTextTertiary,
              maxWidth: CHAT_COLUMN_WIDTH - 8,
              textAlign: 'center' as const,
            }}
          >
            {chatId || `Чат ${chatIndex + 1}`}
          </Text>
        </div>
      ),
      dataIndex: `chat_${chatIndex}`,
      key: `chat_${chatIndex}`,
      width: CHAT_COLUMN_WIDTH,
      align: 'center' as const,
      render: (_: unknown, record: QualityTableRow) => {
        const currentChatId = chatIds[chatIndex];
        
        // Итоговая строка
        if (record.isTotal) {
          if (!currentChatId) {
            return <Text type="secondary" style={{ fontSize: 11 }}>—</Text>;
          }
          const totalScore = chatTotals[chatIndex]?.score;
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

        if (!currentChatId || !record.id) {
          return <Text type="secondary" style={{ fontSize: 10 }}>—</Text>;
        }

        const deduction = qualityMap.deductions?.find(d => 
          d.criteria_id === record.id && d.chat_id === currentChatId
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
  ], [chatIds, chatTotals, qualityMap.deductions, token, isDark, getScoreColor]);

  const dataSource = useMemo(() => {
    const rows: QualityTableRow[] = [];

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

  if (!qualityMap) {
    return null;
  }

  // Расчёт ширины таблицы
  const tableWidth = CRITERIA_COLUMN_WIDTH + (chatIds.length * CHAT_COLUMN_WIDTH);

  return (
    <Card
      size="small"
      title={
        <Space>
          <MessageOutlined style={{ color: token.colorPrimary }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Оценка чатов</span>
          <Tag color="blue" style={{ margin: 0 }}>
            {chatIds.filter(id => id).length} / 15
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

export default QualityTableView;
