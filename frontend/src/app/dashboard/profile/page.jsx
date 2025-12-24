"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Store,
  Building2,
  ShieldCheck,
  Mail,
  Phone,
  Circle,
  Edit3,
  Activity,
  Calendar,
  Briefcase,
  Users,
  Settings,
  Bell,
} from "lucide-react";
import AdminHeader from "@/components/AdminHeader";

export default function Profile() {
  const router = useRouter();

  const [profile, setProfile] = useState({
    username: "-",
    first_name: "-",
    last_name: "-",
    email: "-",
    mobile_number: "-",
    restaurant_name: "N/A",
    branch_name: "N/A",
  });

  // useEffect(() => {
  //   const token = localStorage.getItem("adminToken");
  //   if (!token) {
  //     router.push("/auth/login");
  //     return;
  //   }

  //   const profileData = {
  //     username: localStorage.getItem("username") || "-",
  //     first_name: localStorage.getItem("first_name") || "-",
  //     last_name: localStorage.getItem("last_name") || "-",
  //     email: localStorage.getItem("email") || "-",
  //     mobile_number: localStorage.getItem("mobile_number") || "-",
  //     restaurant_name: localStorage.getItem("restaurant_name") || "N/A",
  //     branch_name: localStorage.getItem("branch_name") || "N/A",
  //   };

  //   console.log("Profile Data:", profileData); // <- यो line add गर्नुहोस्
  //   setProfile(profileData);
  // }, []);


  useEffect(() => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    router.push("/auth/login");
    return;
  }

  

  const fetchProfile = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/me/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();

      setProfile({
        username: data.username || "-",
        first_name: data.first_name || "-",
        last_name: data.last_name || "-",
        email: data.email || "-",
        mobile_number: data.mobile_number || "-",
        restaurant_name: data.restaurant_name || "N/A",
        branch_name: data.branch_name || "N/A",
      });

    } catch (err) {
      console.error(err);
    }
  };

  fetchProfile();
}, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 font-sans">
      <AdminHeader />

      {/* Main Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 max-w-7xl mx-auto">
        {/* Profile Header with Glassmorphism */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-white/80 to-amber-50/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/40 shadow-lg shadow-amber-100/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar with Glow Effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 p-1">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <User size={40} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Admin
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                    {profile.username}
                  </h1>
                  <ShieldCheck className="text-amber-500" size={24} />
                </div>
                <p className="text-gray-600 mb-3">
                  Welcome back to your administrative dashboard
                </p>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                    <Store size={14} /> {profile.restaurant_name}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-medium">
                    <Building2 size={14} /> {profile.branch_name}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
                    <Circle size={14} fill="currentColor" /> Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Restaurant Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-amber-50 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center shadow-lg">
                  <Store className="text-white" size={24} />
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Restaurant</h3>
              <p className="text-gray-600 text-sm truncate">
                {profile.restaurant_name}
              </p>
            </div>
          </div>

          {/* Branch Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-orange-50 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-100 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center shadow-lg">
                  <Building2 className="text-white" size={24} />
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Branch</h3>
              <p className="text-gray-600 text-sm truncate">
                {profile.branch_name}
              </p>
            </div>
          </div>

          {/* Role Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-yellow-50 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-yellow-100 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-400 flex items-center justify-center shadow-lg">
                  <ShieldCheck className="text-white" size={24} />
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold bg-gradient-to-r from-yellow-700 to-yellow-900 bg-clip-text text-transparent">
                    Admin
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Role</h3>
              <p className="text-gray-600 text-sm">Full Access</p>
            </div>
          </div>

          {/* Activity Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-rose-50 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-100 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-400 flex items-center justify-center shadow-lg">
                  <Activity className="text-white" size={24} />
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold bg-gradient-to-r from-rose-700 to-pink-900 bg-clip-text text-transparent">
                    24h
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Active</h3>
              <p className="text-gray-600 text-sm">Last login: Today</p>
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Personal Info */}
          <div className="space-y-6">
            {/* Personal Information Card */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Personal Information
                </h2>
              </div>

              <div className="space-y-5">
                {/* Info Row */}
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-amber-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <User className="text-amber-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-800">
                      {profile.first_name} {profile.last_name}
                    </p>
                  </div>
                </div>

                {/* Info Row */}
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-amber-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Mail className="text-amber-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-800">{profile.email}</p>
                  </div>
                </div>

                {/* Info Row */}
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-amber-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Phone className="text-amber-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Mobile Number</p>
                    <p className="font-medium text-gray-800">
                      {profile.mobile_number}
                    </p>
                  </div>
                </div>

                {/* Info Row */}
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-amber-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Calendar className="text-amber-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-800">January 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Professional Info */}
          <div className="space-y-6">
            {/* Professional Information Card */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center">
                  <Briefcase className="text-white" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Professional Information
                </h2>
              </div>

              <div className="space-y-5">
                {/* Info Row */}
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-orange-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Store className="text-orange-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Restaurant</p>
                    <p className="font-medium text-gray-800">
                      {profile.restaurant_name}
                    </p>
                  </div>
                </div>

                {/* Info Row */}
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-orange-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Building2 className="text-orange-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Branch</p>
                    <p className="font-medium text-gray-800">
                      {profile.branch_name}
                    </p>
                  </div>
                </div>

                {/* Info Row */}
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-orange-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <ShieldCheck className="text-orange-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Role</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        Administrator
                      </span>
                      <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-full font-semibold">
                        Full Access
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Row */}
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-orange-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Users className="text-orange-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Team Members</p>
                    <p className="font-medium text-gray-800">
                      12 Active Members
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            {/* <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 border border-amber-200/50">
            <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="group p-3 rounded-xl bg-white hover:bg-amber-50 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 group-hover:bg-amber-200 transition-colors flex items-center justify-center">
                    <Settings className="text-amber-600" size={18} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Settings</span>
                </div>
              </button>
              <button className="group p-3 rounded-xl bg-white hover:bg-amber-50 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 group-hover:bg-amber-200 transition-colors flex items-center justify-center">
                    <Bell className="text-amber-600" size={18} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Notifications</span>
                </div>
              </button>
            </div>
          </div> */}

            {/* Add this component after your main content */}
            <div className="fixed bottom-6 right-6 z-50">
              <div className="relative group">
                {/* Floating Calendar Button */}
                <button className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center">
                  <Calendar className="text-white" size={24} />
                </button>

                {/* Expanded Calendar Panel */}
                <div className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">
                        Today's Schedule
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>

                    {/* Mini Calendar */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs text-gray-500 font-semibold py-1"
                        >
                          {day}
                        </div>
                      ))}

                      {Array.from({ length: 31 }, (_, i) => {
                        const day = i + 1;
                        const isToday = day === new Date().getDate();
                        return (
                          <div
                            key={day}
                            className={`text-center text-sm py-1 rounded cursor-pointer ${
                              isToday
                                ? "bg-amber-600 text-white"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
