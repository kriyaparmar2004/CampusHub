import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import EventCard from '../components/EventCard';
const API = import.meta.env.VITE_API_BASE_URL|| 'http://localhost:5000';
function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Make sure to pass the search query in the request
        const res = await axios.get(`${API}/api/events/upcoming/all`, {
          params: { search: searchQuery }, // Pass the search query in the URL
        });
    
        console.log("Response from backend:", res.data);
    
        let allEvents = res.data;
    
        // Apply additional search filtering on the frontend if necessary
        if (searchQuery) {
          const searchTerms = searchQuery.toLowerCase().split(' ');
          allEvents = allEvents.filter(event => {
            const searchableText = [
              event.title,
              event.shortDescription,
              event.eventDescription,
              event.committeeName,
              event.location
            ].join(' ').toLowerCase();
            
            return searchTerms.some(term => searchableText.includes(term));
          });
        }
    
        setEvents(allEvents);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchQuery]);

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {searchQuery ? `Search Results for "${searchQuery}"` : 'Upcoming Events'}
      </h1>
      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? 'No events found matching your search.' : 'No upcoming events.'}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map(event => (
            <EventCard
              key={event._id}
              id={event._id}
              title={event.title}
              description={event.shortDescription}
              date={event.date}
              startTime={event.startTime}
              endTime={event.endTime}
              imageUrl={event.imageUrl}
              location={event.location}
              committee={event.committeeName}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EventList;
