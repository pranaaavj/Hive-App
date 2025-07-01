import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Mail, 
  Database, 
  Bell, 
  Users, 
  FileText, 
  Settings as SettingsIcon, 
  Save,
  Eye,
  Lock
} from "lucide-react";

export const SettingsSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600 mt-2">Configure your social media platform's core settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Platform Information
                </CardTitle>
                <CardDescription>Basic settings for your social media platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="SocialConnect" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-description">Description</Label>
                  <Textarea 
                    id="platform-description" 
                    defaultValue="A modern social media platform for connecting people worldwide"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" type="email" defaultValue="support@socialconnect.com" />
                </div>
                <Button className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Preferences
                </CardTitle>
                <CardDescription>Configure default user settings and limitations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow User Registration</Label>
                    <div className="text-sm text-gray-600">Enable new users to sign up</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Verification Required</Label>
                    <div className="text-sm text-gray-600">Require email verification for new accounts</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="max-posts">Max Posts Per Day</Label>
                  <Input id="max-posts" type="number" defaultValue="50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-followers">Max Followers Per User</Label>
                  <Input id="max-followers" type="number" defaultValue="10000" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Content Moderation
                </CardTitle>
                <CardDescription>Configure automated and manual content moderation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-detect Spam</Label>
                    <div className="text-sm text-gray-600">Automatically flag suspicious content</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Profanity Filter</Label>
                    <div className="text-sm text-gray-600">Filter out inappropriate language</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Manual Review Required</Label>
                    <div className="text-sm text-gray-600">Require manual review for flagged content</div>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-threshold">Auto-hide Threshold</Label>
                  <Input id="report-threshold" type="number" defaultValue="5" />
                  <div className="text-sm text-gray-600">Hide content after this many reports</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Community Guidelines
                </CardTitle>
                <CardDescription>Manage platform rules and policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Blocked Keywords</Label>
                  <Textarea 
                    placeholder="Enter keywords to block (one per line)"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Community Rules</Label>
                  <Button variant="outline" className="w-full">
                    Edit Community Guidelines
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Violation Actions</Label>
                  <div className="flex gap-2">
                    <Badge variant="outline">Warning</Badge>
                    <Badge variant="outline">Temporary Ban</Badge>
                    <Badge variant="outline">Permanent Ban</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system and user notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Email Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>New User Registration</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Content Reports</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>System Alerts</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Weekly Summary</Label>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Push Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Security Alerts</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>High Priority Reports</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>System Maintenance</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Performance Alerts</Label>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Privacy Controls
                </CardTitle>
                <CardDescription>Configure platform privacy and data protection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public User Profiles</Label>
                    <div className="text-sm text-gray-600">Allow profiles to be publicly visible</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Search Engine Indexing</Label>
                    <div className="text-sm text-gray-600">Allow search engines to index content</div>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Analytics</Label>
                    <div className="text-sm text-gray-600">Collect anonymous usage analytics</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-retention">Data Retention Period (days)</Label>
                  <Input id="data-retention" type="number" defaultValue="365" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure platform security measures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <div className="text-sm text-gray-600">Require 2FA for admin accounts</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Attempt Limiting</Label>
                    <div className="text-sm text-gray-600">Limit failed login attempts</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input id="session-timeout" type="number" defaultValue="60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-policy">Password Policy</Label>
                  <Button variant="outline" className="w-full">
                    Configure Password Requirements
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Third-party Integrations
              </CardTitle>
              <CardDescription>Manage external service integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Email Service", provider: "SendGrid", status: "Connected", color: "green" },
                  { name: "Analytics", provider: "Google Analytics", status: "Connected", color: "green" },
                  { name: "File Storage", provider: "AWS S3", status: "Connected", color: "green" },
                  { name: "Payment Gateway", provider: "Stripe", status: "Not Connected", color: "gray" },
                  { name: "Social Login", provider: "OAuth", status: "Connected", color: "green" },
                  { name: "SMS Service", provider: "Twilio", status: "Not Connected", color: "gray" },
                ].map((integration) => (
                  <Card key={integration.name} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{integration.name}</h4>
                        <Badge 
                          variant={integration.color === "green" ? "default" : "secondary"}
                          className={integration.color === "green" ? "bg-green-100 text-green-800" : ""}
                        >
                          {integration.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{integration.provider}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        {integration.status === "Connected" ? "Configure" : "Connect"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Advanced Configuration
              </CardTitle>
              <CardDescription>Advanced technical settings and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">System Maintenance</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="mr-2 h-4 w-4" />
                      Database Cleanup
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Clear System Logs
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Reset Cache
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Export & Backup</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      Export User Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Backup Database
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Download System Logs
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium text-red-600">Danger Zone</h3>
                <div className="p-4 border border-red-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Maintenance Mode</h4>
                      <p className="text-sm text-gray-600">Temporarily disable platform access</p>
                    </div>
                    <Button variant="destructive" size="sm">Enable</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Reset All Settings</h4>
                      <p className="text-sm text-gray-600">Restore all settings to default values</p>
                    </div>
                    <Button variant="destructive" size="sm">Reset</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};