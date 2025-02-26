import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserDetails } from "@/types/wishlist"

interface UserDetailsCardProps {
  userDetails: UserDetails
}

export function UserDetailsCard({ userDetails }: UserDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <p>
            <strong>Name:</strong> {userDetails.name}
          </p>
          <p>
            <strong>Address:</strong> {userDetails.address}
          </p>
          <p>
            <strong>Phone:</strong> {userDetails.phone}
          </p>
          <p>
            <strong>Email:</strong> {userDetails.email}
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 