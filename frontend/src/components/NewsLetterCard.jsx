import { useState, useMemo } from 'react';
import { Card } from '@nextui-org/react';

import timestampFormatter from '../utils/timestampFormatter';



export default function NewsLetterCard({ newsletter_id, title, description, created_on, read_length, written_by_username, written_by_avatar, likes_count = 0, content, lastNewsLetterArticleRef, expanded=false }) {

    const [isExpanded, setIsExpanded] = useState(!!expanded);

    const created_on_formatted = useMemo(() => timestampFormatter(created_on), [created_on]);

    const toggleExpansion = () => setIsExpanded(prev => !prev);

    return (
        <Card key={newsletter_id} ref={lastNewsLetterArticleRef} style={{ boxShadow: '3px 8px 16px 9px #28CDFF', padding: '15px', maxWidth: '100%', textAlign: 'left' }}>
            <h2>{title}</h2>
            <h4>{description}</h4>
            <button className="newsletter-card-expand-button" style={{
                border: 'none',
                textAlign: 'left',
                background: 'none',
                fontSize: '14px',
                borderBottom: '1px white dashed',
                borderLeft: '1px white dashed',
                borderTop: 0,
                borderRight: 'none'
            }} onClick={toggleExpansion}>Show {isExpanded ? 'less' : 'more'}...</button>
            {isExpanded && <div dangerouslySetInnerHTML={{ __html: content }} />}
            <p>Created At: {created_on_formatted}</p>
            <p>Written By: {written_by_username}</p>
            <p>{likes_count} <i className="fa fa-heart" /> </p>
            {written_by_avatar && <img src={written_by_avatar} />}
            {!!read_length && <p>{read_length}-minute read</p>}
        </Card>
    );
}