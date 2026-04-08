import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import {
  RiSwordLine, RiMedalLine, RiTimeLine, RiInformationFill,
  RiSendPlaneLine, RiCloseLine, RiCheckDoubleLine, RiErrorWarningLine,
  RiFilterLine
} from 'react-icons/ri';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DIFF_COLORS = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444', Expert: '#8b5cf6' };
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const STATUSES = ['All', 'Open', 'Pending', 'Passed'];

const ChallengesPage = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [solutionUrl, setSolutionUrl] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Filters
  const [diffFilter, setDiffFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => { fetchChallenges(); }, []);

  const fetchChallenges = async () => {
    try {
      const { data } = await api.get('/challenges');
      if (data.success) setChallenges(data.challenges);
    } catch (err) { console.error('Fetch challenges failed', err); }
    finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    return challenges.filter(c => {
      const diffOk = diffFilter === 'All' || c.difficulty === diffFilter;
      let statusOk = true;
      if (statusFilter === 'Open') statusOk = !c.userStatus;
      else if (statusFilter === 'Pending') statusOk = c.userStatus === 'Pending';
      else if (statusFilter === 'Passed') statusOk = c.userStatus === 'Passed';
      return diffOk && statusOk;
    });
  }, [challenges, diffFilter, statusFilter]);

  const handleOpenDetail = async (id) => {
    try {
      setSubmitSuccess(false); setSolutionUrl(''); setSubmitError('');
      const { data } = await api.get(`/challenges/${id}`);
      if (data.success) setSelectedChallenge(data.challenge);
    } catch (err) { console.error('Failed to load details', err); }
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    setSubmitError(''); setSubmitLoading(true);
    try {
      const { data } = await api.post(`/challenges/${selectedChallenge._id}/submit`, { solutionUrl });
      if (data.success) {
        setSubmitSuccess(true);
        setSelectedChallenge({ ...selectedChallenge, userStatus: 'Pending', submissionUrl: solutionUrl });
        setChallenges(prev => prev.map(c => c._id === selectedChallenge._id ? { ...c, userStatus: 'Pending' } : c));
      }
    } catch (err) { setSubmitError(err.response?.data?.message || 'Submission failed'); }
    finally { setSubmitLoading(false); }
  };

  const PillFilter = ({ options, value, onChange, colorMap }) => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} style={{
          padding: '0.35rem 0.9rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700,
          border: `1px solid ${value === opt ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
          background: value === opt ? 'rgba(124,58,237,0.15)' : 'transparent',
          color: value === opt ? 'var(--color-accent-primary)' : 'var(--color-text-muted)',
          cursor: 'pointer', transition: 'all 0.15s',
          ...(colorMap && opt !== 'All' ? { borderColor: value === opt ? colorMap[opt] : undefined, background: value === opt ? `${colorMap[opt]}20` : undefined, color: value === opt ? colorMap[opt] : undefined } : {}),
        }}>
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>Coding Challenges</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Sharpen your skills, submit solutions, and climb the Leaderboard.</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem', padding: '1rem 1.25rem', background: 'var(--color-bg-card)', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>
          <RiFilterLine size={16} /> Filters
        </div>
        <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Difficulty</div>
          <PillFilter options={DIFFICULTIES} value={diffFilter} onChange={setDiffFilter} colorMap={DIFF_COLORS} />
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Status</div>
          <PillFilter options={STATUSES} value={statusFilter} onChange={setStatusFilter} />
        </div>
        {(diffFilter !== 'All' || statusFilter !== 'All') && (
          <button onClick={() => { setDiffFilter('All'); setStatusFilter('All'); }} style={{ marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.3rem 0.75rem', borderRadius: '8px', cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>

      {/* Count */}
      <div style={{ marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
        Showing <b style={{ color: 'var(--color-text-primary)' }}>{filtered.length}</b> of {challenges.length} challenges
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>Loading...</div>
      ) : (
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filtered.map((c, i) => (
                <motion.div
                  key={c._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                  onClick={() => handleOpenDetail(c._id)}
                  style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
                  whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${DIFF_COLORS[c.difficulty]}, transparent)` }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, background: `${DIFF_COLORS[c.difficulty]}15`, color: DIFF_COLORS[c.difficulty], border: `1px solid ${DIFF_COLORS[c.difficulty]}40` }}>{c.difficulty}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent-secondary)' }}><RiMedalLine /> {c.points} pts</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{c.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{c.category}</span>
                    {c.userStatus === 'Passed' && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', fontWeight: 700 }}><RiCheckDoubleLine /> Passed</span>}
                    {c.userStatus === 'Pending' && <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700 }}>In Review</span>}
                    {!c.userStatus && <RiSwordLine size={18} color="var(--color-text-primary)" />}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '5rem', background: 'var(--color-bg-card)', borderRadius: '20px', border: '1px dashed var(--color-border)' }}>
              <RiInformationFill size={48} color="var(--color-text-muted)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontWeight: 700 }}>No challenges match these filters</h3>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedChallenge && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedChallenge(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99, backdropFilter: 'blur(4px)' }} />
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: '-50%', x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }}
              style={{ position: 'fixed', top: '50%', left: '50%', width: '100%', maxWidth: '800px', maxHeight: '90vh', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '24px', zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}
            >
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-secondary)' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedChallenge.title}</h2>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: DIFF_COLORS[selectedChallenge.difficulty] }}>{selectedChallenge.difficulty}</span>
                    <span style={{ color: 'var(--color-accent-secondary)' }}>{selectedChallenge.points} Points</span>
                    {selectedChallenge.deadline && <span style={{ color: 'var(--color-text-muted)' }}>Deadline: {new Date(selectedChallenge.deadline).toLocaleDateString()}</span>}
                  </div>
                </div>
                <button onClick={() => setSelectedChallenge(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><RiCloseLine size={28} /></button>
              </div>
              <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                <div className="markdown-body" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{selectedChallenge.description}</ReactMarkdown>
                </div>
                <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Submit Your Solution</h3>
                  {selectedChallenge.userStatus === 'Passed' ? (
                    <div style={{ padding: '1.5rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <RiCheckDoubleLine size={24} /> <b>Passed!</b> You've successfully solved this challenge.
                    </div>
                  ) : selectedChallenge.userStatus === 'Pending' ? (
                    <div style={{ padding: '1.5rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <RiTimeLine size={24} /> <b>In Review.</b> Admins are reviewing your submission.
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitSolution} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {submitError && <div style={{ color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RiErrorWarningLine /> {submitError}</div>}
                      <input type="url" required value={solutionUrl} onChange={e => setSolutionUrl(e.target.value)} placeholder="https://github.com/your-username/repo-link"
                        style={{ padding: '1rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                      <button type="submit" disabled={submitLoading} style={{ padding: '1rem', borderRadius: '12px', background: 'var(--color-accent-primary)', color: '#fff', border: 'none', fontWeight: 700, cursor: submitLoading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <RiSendPlaneLine size={18} /> {submitLoading ? 'Submitting...' : 'Submit Code for Review'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChallengesPage;
