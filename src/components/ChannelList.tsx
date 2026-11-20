import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Tv } from 'lucide-react';
import { StalkerChannel } from '@/lib/stalker-portal';

interface ChannelListProps {
  channels: StalkerChannel[];
  selectedChannel: StalkerChannel | null;
  onChannelSelect: (channel: StalkerChannel) => void;
  isLoading: boolean;
}

const ChannelList = ({ channels, selectedChannel, onChannelSelect, isLoading }: ChannelListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Extract unique groups
  const groups = Array.from(new Set(channels.map((ch) => ch.group).filter((g): g is string => Boolean(g))));

  // Filter channels by search and group
  const filteredChannels = channels.filter((channel) => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = !selectedGroup || channel.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  // Group channels by category
  const groupedChannels = selectedGroup
    ? { [selectedGroup]: filteredChannels }
    : filteredChannels.reduce((acc, channel) => {
        const group = channel.group || 'Uncategorized';
        if (!acc[group]) acc[group] = [];
        acc[group].push(channel);
        return acc;
      }, {} as Record<string, StalkerChannel[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading channels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 space-y-3 border-b border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-800 text-white"
          />
        </div>
        
        {/* Group Filter */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedGroup === null ? 'default' : 'outline'}
            className={`cursor-pointer ${
              selectedGroup === null
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-gray-400 hover:bg-slate-800 border-slate-700'
            }`}
            onClick={() => setSelectedGroup(null)}
          >
            All Channels
          </Badge>
          {groups.slice(0, 8).map((group) => (
            <Badge
              key={group}
              variant={selectedGroup === group ? 'default' : 'outline'}
              className={`cursor-pointer ${
                selectedGroup === group
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-gray-400 hover:bg-slate-800 border-slate-700'
              }`}
              onClick={() => setSelectedGroup(group)}
            >
              {group}
            </Badge>
          ))}
        </div>
        
        <p className="text-sm text-gray-400">
          {filteredChannels.length} {filteredChannels.length === 1 ? 'channel' : 'channels'}
        </p>
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(groupedChannels).map(([groupName, groupChannels]) => (
            <div key={groupName} className="mb-4">
              {groupName && !selectedGroup && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 sticky top-0 bg-slate-950">
                  {groupName}
                </h3>
              )}
              
              <div className="space-y-1">
                {groupChannels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant="ghost"
                    className={`w-full justify-start h-auto py-3 px-3 ${
                      selectedChannel?.id === channel.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-transparent text-gray-300 hover:bg-slate-900'
                    }`}
                    onClick={() => onChannelSelect(channel)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {channel.logo && (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.className = 'w-8 h-8 bg-slate-800 flex items-center justify-center rounded';
                            e.currentTarget.innerHTML = '<Tv class="w-4 h-4 text-gray-400" />';
                          }}
                        />
                      )}
                      {!channel.logo && (
                        <div className="w-8 h-8 bg-slate-800 flex items-center justify-center rounded">
                          <Tv className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="text-left flex-1">
                        <div className="font-medium text-sm">{channel.name}</div>
                        {channel.number && (
                          <div className="text-xs text-gray-400">CH {channel.number}</div>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
          
          {filteredChannels.length === 0 && (
            <div className="text-center py-12">
              <Tv className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No channels found</p>
              <p className="text-sm text-gray-500">Try adjusting your search</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChannelList;
