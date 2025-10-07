import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { User, Settings, LogOut, Map } from "lucide-react";
import { currentUser } from "../data/mockData";
import logoImage from "figma:asset/32a9f97ebfa773dabe97368d7e406f5ed1e26205.png";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const navItems = [
    { id: "feed", label: "Explore" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "games", label: "Games" },
    { id: "map", label: "Map", icon: Map },
    { id: "hackathons", label: "Hackathons" },
    { id: "challenges", label: "Challenges" },
    { id: "hiring", label: "Hire Talent" },
  ];

  return (
    <nav className="bg-card border-b border-border px-6 py-4 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div 
            className="cursor-pointer flex items-center space-x-3"
            onClick={() => onPageChange("feed")}
          >
            <img src={logoImage} alt="DevActa Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-2xl text-foreground font-[Aoboshi_One] font-bold italic">DevActa</h1>
          </div>
          
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`px-3 py-2 transition-colors flex items-center space-x-1 ${
                  currentPage === item.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Avatar Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:bg-secondary transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 z-[9999] bg-popover border border-border shadow-lg" 
              align="end" 
              sideOffset={8}
            >
              <DropdownMenuItem 
                onSelect={() => onPageChange("profile")} 
                className="cursor-pointer hover:bg-accent"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={() => onPageChange("settings")} 
                className="cursor-pointer hover:bg-accent"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-accent text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}