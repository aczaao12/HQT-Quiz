import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export const useStatistics = (user, filters = {}) => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { days = 7, searchTerm = '', specificDate = null } = filters;

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                let startDate, endDate;

                if (specificDate) {
                    // Filter by specific date (start of day to end of day)
                    startDate = new Date(specificDate);
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(specificDate);
                    endDate.setHours(23, 59, 59, 999);
                } else {
                    // Filter by days range
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - days);
                    endDate = new Date();
                }

                const startTimestamp = Timestamp.fromDate(startDate);
                const endTimestamp = Timestamp.fromDate(endDate);

                // Query results for the current user in the date range
                const q = query(
                    collection(db, 'results'),
                    where('student_id', '==', user.uid),
                    where('submission_time', '>=', startTimestamp),
                    where('submission_time', '<=', endTimestamp)
                );

                const querySnapshot = await getDocs(q);
                const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Group by assignment_id to aggregate stats
                const groupedResults = results.reduce((acc, result) => {
                    const key = result.assignment_id;
                    if (!acc[key]) {
                        acc[key] = {
                            assignment_id: key,
                            exam_title: result.exam_title || 'Unknown Exam',
                            exam_id: result.exam_id,
                            attempts: [],
                            total_score: 0,
                            max_score: 0,
                            latest_submission: null
                        };
                    }

                    acc[key].attempts.push(result);
                    acc[key].total_score += result.score;
                    acc[key].max_score = Math.max(acc[key].max_score, result.score);

                    // Track latest submission for sorting or display
                    if (!acc[key].latest_submission || result.submission_time > acc[key].latest_submission.submission_time) {
                        acc[key].latest_submission = result;
                    }

                    return acc;
                }, {});

                // Calculate averages and format for display
                let processedStats = Object.values(groupedResults).map(item => ({
                    ...item,
                    attempt_count: item.attempts.length,
                    average_score: (item.total_score / item.attempts.length).toFixed(1),
                    last_taken: item.latest_submission.submission_time.toDate(),
                })).sort((a, b) => b.last_taken - a.last_taken); // Sort by most recent

                // Apply search filter if provided (OR logic with other filters)
                if (searchTerm && searchTerm.trim() !== '') {
                    const lowerSearch = searchTerm.toLowerCase();
                    processedStats = processedStats.filter(stat =>
                        stat.exam_title.toLowerCase().includes(lowerSearch)
                    );
                }

                setStats(processedStats);
            } catch (err) {
                console.error("Error fetching statistics:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, days, searchTerm, specificDate]);

    return { stats, loading, error };
};
