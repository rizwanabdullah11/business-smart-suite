"use client"

import Link from "next/link"
import { usePermissions } from "@/hooks/use-permissions"
import { DASHBOARD_MODULE_GROUPS } from "@/constant/dashboard-module-groups"

export function ModuleHubContent() {
  const { can, loading } = usePermissions()

  const visibleGroups = DASHBOARD_MODULE_GROUPS.map((group) => ({
    ...group,
    modules: group.modules.filter((m) => !m.permission || can(m.permission)),
  })).filter((group) => group.modules.length > 0)

  return (
    <div className="min-h-screen relative">
      {/* LAYER 1: Sophisticated Purple Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-purple-900/30 to-slate-900/50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.2),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_70%)]"></div>
      </div>

      {/* LAYER 2: Harmonized Purple-Themed Animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Elegant Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.08)_1px,transparent_1px)] bg-[size:60px_60px] animate-pulse"></div>
        
        {/* Sophisticated Floating Elements */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-gradient-to-r from-purple-500/25 to-pink-500/25 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
        <div className="absolute top-20 right-20 w-12 h-12 bg-gradient-to-r from-indigo-500/25 to-purple-500/25 rounded-lg opacity-50 animate-bounce" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-10 h-10 bg-gradient-to-r from-violet-500/25 to-purple-500/25 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '2s', animationDuration: '4.5s' }}></div>
        <div className="absolute bottom-10 right-1/3 w-18 h-18 bg-gradient-to-r from-purple-500/25 to-indigo-500/25 rounded-lg opacity-40 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '5.5s' }}></div>
        
        {/* Additional elegant elements */}
        <div className="absolute top-1/3 left-1/6 w-12 h-12 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '4.2s' }}></div>
        <div className="absolute top-2/3 right-1/6 w-14 h-14 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-lg opacity-45 animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '5.1s' }}></div>
        
        {/* Elegant Rotating Elements */}
        <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-lg shadow-lg animate-spin" style={{ animationDuration: '10s' }}></div>
        </div>
        <div className="absolute top-3/4 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-lg shadow-lg animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }}></div>
        </div>
        
        {/* Sophisticated Pulsing Rings */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-24 h-24 border-4 border-purple-400/20 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-4 border-pink-400/25 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Elegant Particles */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/40 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* LAYER 3: Content */}
      <div className="relative z-10">
        <div className="px-6 pt-12 pb-12">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-white opacity-60 text-sm">Loading modules…</div>
              </div>
            ) : (
              <>
                {/* Professional Header */}
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Business Smart Suite</h1>
                    <p className="text-purple-200 text-xl drop-shadow">Your comprehensive business management portal</p>
                  </div>
                  <Link href="/analytics">
                    <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-sm">
                      Analytics Dashboard
                    </button>
                  </Link>
                </div>

                {/* Revolutionary Company Portal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                  {visibleGroups.map((group, sectionIndex) => {
                    const GroupIcon = group.icon
                    return (
                      <div key={sectionIndex} className="group">
                        <div
                          className={`relative overflow-hidden rounded-3xl transition-all duration-1000 ease-out
                            bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80
                            border border-slate-600/30 hover:border-slate-500/50
                            shadow-2xl hover:shadow-3xl
                            backdrop-blur-2xl
                            hover:scale-[1.03] hover:-translate-y-2
                            focus-within:ring-2 focus-within:ring-slate-400/40 focus-within:outline-none`}
                          style={{ minHeight: 'clamp(400px, 45vh, 450px)' }}
                          role="region"
                          aria-label={`${group.title} section`}
                        >
                          {/* Sophisticated Background Elements */}
                          <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-5 blur-3xl" style={{ background: group.color }}></div>
                            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-5 blur-2xl" style={{ background: group.color }}></div>
                          </div>

                          {/* Enterprise Section Header */}
                          <div className="relative p-12 lg:p-16 border-b border-slate-600/30">
                            {/* Subtle Accent Pattern */}
                            <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(to bottom right, ${group.color}33, ${group.color}26, transparent)` }}></div>
                            
                            {/* Premium Corner Accent */}
                            <div className="absolute top-0 right-0 w-48 h-48 opacity-15" style={{ background: `linear-gradient(to bottom left, ${group.color}, ${group.color}cc, transparent)` }}></div>
                            
                            <div className="flex items-center gap-10 lg:gap-16 relative z-10">
                              {/* Revolutionary Enterprise Icon */}
                              <div 
                                className="enterprise-hero-icon inline-flex items-center justify-center rounded-3xl"
                                style={{ 
                                  background: `linear-gradient(to bottom right, ${group.color}, ${group.color}cc, ${group.color}99)`,
                                  boxShadow: `0 20px 40px ${group.color}66`
                                }}
                              >
                                <div className="w-12 h-12 lg:w-16 lg:h-16 text-white drop-shadow-lg">
                                  <GroupIcon className="w-full h-full" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <h2 className="enterprise-section-title text-4xl lg:text-5xl font-bold mb-4 leading-tight text-white">{group.title}</h2>
                              </div>
                            </div>
                          </div>

                          {/* Revolutionary Navigation Grid */}
                          <div className="relative p-10 lg:p-14">
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                              {group.modules.map((item, itemIndex) => {
                                const ModIcon = item.icon
                                return (
                                  <Link
                                    key={itemIndex}
                                    href={item.href}
                                    className="group/item block focus:outline-none focus:ring-2 focus:ring-slate-400/40 focus:ring-offset-2 focus:ring-offset-slate-900"
                                    aria-label={`Navigate to ${item.label}`}
                                  >
                                    <div
                                      className="enterprise-nav-item aspect-square p-4 lg:p-6 rounded-2xl border transition-all duration-1000 ease-out relative overflow-hidden
                                        bg-gradient-to-br from-slate-800/60 via-slate-700/50 to-slate-800/60
                                        border-slate-600/40 hover:border-slate-500/60
                                        shadow-xl hover:shadow-2xl hover:shadow-3xl
                                        transform hover:-translate-y-4 hover:scale-[1.1]
                                        focus:ring-2 focus:ring-slate-400/40"
                                      style={{
                                        boxShadow: `0 10px 30px ${group.color}33`
                                      }}
                                    >
                                      {/* Enterprise Accent Border */}
                                      <div 
                                        className="absolute top-0 left-0 w-3 h-full opacity-0 group-hover/item:opacity-100 transition-all duration-1000"
                                        style={{ background: `linear-gradient(to bottom, ${group.color}, ${group.color}cc)` }}
                                      ></div>
                                      
                                      {/* Premium Corner Glow */}
                                      <div 
                                        className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover/item:opacity-50 transition-opacity duration-1000"
                                        style={{ background: `linear-gradient(to bottom left, ${group.color}4d, transparent)` }}
                                      ></div>
                                      
                                      <div className="flex flex-col items-center text-center h-full justify-between relative z-10">
                                        {/* Optimized Big Navigation Icon */}
                                        <div 
                                          className="optimized-nav-icon flex items-center justify-center rounded-2xl mb-2 lg:mb-3 transition-all duration-1000 group-hover/item:scale-110"
                                          style={{ 
                                            background: `linear-gradient(to bottom right, ${group.color}, ${group.color}cc, ${group.color}99)`,
                                            boxShadow: `0 10px 20px ${group.color}66`
                                          }}
                                        >
                                          <div className="w-12 h-12 lg:w-16 lg:h-16 drop-shadow-lg flex items-center justify-center text-white">
                                            <ModIcon className="w-full h-full" />
                                          </div>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center px-1">
                                          <h3 className="font-poppins font-semibold text-slate-200 text-xs lg:text-sm leading-tight drop-shadow-lg group-hover/item:text-white transition-all duration-700 line-clamp-2">
                                            {item.label}
                                          </h3>
                                        </div>
                                        
                                        {/* Enterprise Hover Glow */}
                                        <div 
                                          className="absolute inset-0 rounded-2xl opacity-0 group-hover/item:opacity-20 transition-all duration-1000"
                                          style={{ background: `linear-gradient(to bottom right, ${group.color}66, ${group.color}4d, ${group.color}33)` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </Link>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Professional System Status */}
        <div className="text-center pb-12">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 shadow-lg">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium drop-shadow">System Status: Optimal Performance</span>
          </div>
        </div>
      </div>
    </div>
  )
}
